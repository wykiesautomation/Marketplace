const express=require('express');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const config=require('../config');
const {requireRole}=require('../auth');
const {readDb,writeDb,addEvent}=require('../db');
const r=express.Router();

const tempDir=path.join(config.uploadDir,'admin-product-studio');
fs.mkdirSync(tempDir,{recursive:true});
fs.mkdirSync(config.productPackageDir,{recursive:true});
fs.mkdirSync(config.productImageDir,{recursive:true});
const upload=multer({dest:tempDir,limits:{fileSize:config.uploadMaxMb*1024*1024,files:2}});
const safe=s=>String(s||'').trim().replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'')||'file';
const slug=s=>String(s||'product').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const move=(src,dst)=>{fs.mkdirSync(path.dirname(dst),{recursive:true});if(fs.existsSync(dst))fs.unlinkSync(dst);fs.renameSync(src,dst)};

r.get('/status',requireRole('admin'),(req,res)=>{
 const db=readDb();
 res.json((db.products||[]).map(p=>({id:p.id,name:p.name,slug:p.slug,price:p.price,status:p.status,approvalStatus:p.approvalStatus,image:p.image||'',packageName:p.packageName||'',packageSize:p.packageSize||0,packageVersion:p.packageVersion||'',packageUploadedAt:p.packageUploadedAt||''})).sort((a,b)=>a.name.localeCompare(b.name)));
});

r.post('/save',requireRole('admin'),upload.fields([{name:'image',maxCount:1},{name:'package',maxCount:1}]),(req,res)=>{
 const cleanup=()=>Object.values(req.files||{}).flat().forEach(f=>{if(fs.existsSync(f.path))fs.unlinkSync(f.path)});
 try{
  const db=readDb();
  const editing=String(req.body.productId||'').trim();
  let p=editing?(db.products||[]).find(x=>x.id===editing):null;
  const name=String(req.body.name||'').trim();
  if(!p&&!name){cleanup();return res.status(400).json({error:'Product name is required.'})}
  if(!p){
   const now=Date.now();
   p={id:'p_admin_'+now,sellerId:req.currentUser.id,name,slug:slug(name)+'-'+now,createdAt:new Date().toISOString()};
   db.products=db.products||[];db.products.unshift(p);
  }
  const fields=['name','category','platform','type','salesMode','shortDescription','desc'];
  fields.forEach(k=>{if(req.body[k]!==undefined&&String(req.body[k]).trim()!=='')p[k]=String(req.body[k]).trim()});
  if(req.body.price!==undefined&&req.body.price!=='')p.price=Math.max(0,Number(req.body.price)||0);
  p.status=req.body.publishNow==='true'?'active':(p.status||'draft');
  p.approvalStatus=req.body.publishNow==='true'?'approved':(p.approvalStatus||'pending');
  if(req.body.publishNow==='true'){p.approvedAt=new Date().toISOString();p.approvedBy=req.currentUser.id}

  const image=req.files?.image?.[0];
  if(image){
   const ext=path.extname(image.originalname).toLowerCase();
   if(!['.jpg','.jpeg','.png','.webp'].includes(ext)){cleanup();return res.status(400).json({error:'Photo must be JPG, PNG or WebP.'})}
   const file=safe(p.slug)+ext;
   move(image.path,path.join(config.productImageDir,file));
   p.image='/product-images/'+file;
   p.imageUploadedAt=new Date().toISOString();
  }
  const pack=req.files?.package?.[0];
  if(pack){
   if(path.extname(pack.originalname).toLowerCase()!=='.zip'){cleanup();return res.status(400).json({error:'Product package must be one ZIP file.'})}
   const dir=path.join(config.productPackageDir,safe(p.slug));
   const file=safe(pack.originalname);
   const dst=path.join(dir,file);
   move(pack.path,dst);
   p.packagePath=dst;p.packageName=pack.originalname;p.packageSize=pack.size;p.packageSha256=hash(dst);
   p.packageVersion=String(req.body.packageVersion||'1.0').trim();p.packageUploadedAt=new Date().toISOString();p.packageActive=true;
  }
  p.updatedAt=new Date().toISOString();
  writeDb(db);addEvent('admin.product_studio_saved','Admin saved product, photo or package',{productId:p.id,hasImage:!!image,hasPackage:!!pack});
  res.json({ok:true,product:p});
 }catch(e){cleanup();res.status(500).json({error:e.message})}
});

r.get('/:id/test-download',requireRole('admin'),(req,res)=>{
 const p=(readDb().products||[]).find(x=>x.id===req.params.id);
 if(!p||!p.packagePath||!fs.existsSync(p.packagePath))return res.status(404).send('Package not found');
 res.download(p.packagePath,p.packageName||path.basename(p.packagePath));
});
module.exports=r;
