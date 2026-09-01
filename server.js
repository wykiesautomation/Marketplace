const express=require('express');const path=require('path');const config=require('./src/config');const{parseCookies,setSecurityHeaders,rateLimit}=require('./src/security');require('./src/storage/fileStore').ensureDirs();const app=express();
const allowedOrigins=new Set(['https://marketplace.wykiesautomation.co.za','https://marketplace-api-o19b.onrender.com']);
app.use((req,res,next)=>{
  const origin=req.headers.origin;
  if(origin&&allowedOrigins.has(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,x-demo-user');
  }
  if(req.method==='OPTIONS')return res.sendStatus(origin&&allowedOrigins.has(origin)?204:403);
  next();
});app.use(parseCookies);app.use(setSecurityHeaders);app.use(rateLimit());app.use(express.json({limit:'2mb'}));app.use(express.urlencoded({extended:true}));app.get('/api/health',(req,res)=>res.json({ok:true,build:'27-render-api-connected'}));app.use('/api/public',require('./src/routes/public'));app.use('/api/listings',require('./src/routes/listings'));app.use('/api/marketplace-settings',require('./src/routes/marketplaceSettings'));app.use('/api/marketplace-live',require('./src/routes/marketplaceLive'));app.use('/listing-images',express.static(require('./src/config').listingImageDir));app.use('/api/seller',require('./src/routes/seller'));app.use('/api/admin/sellers',require('./src/routes/adminSellers'));app.use('/api/admin/products',require('./src/routes/adminProducts'));app.use('/api/admin/storage',require('./src/routes/storageAdmin'));app.use('/api/admin/payouts',require('./src/routes/payoutsAdmin'));app.use('/api/admin/payfast',require('./src/routes/payfastAdmin'));app.use('/api/admin',require('./src/routes/admin'));app.use('/api/admin/db',require('./src/routes/dbAdmin'));app.use('/api',require('./src/routes/payments'));app.use('/api',require('./src/routes/downloads'));app.use(express.static(__dirname));app.listen(config.port,()=>console.log('Marketplace API running http://localhost:'+config.port));
