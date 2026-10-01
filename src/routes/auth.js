const r=require('express').Router();
const{readDb}=require('../db');
const{normalizeEmail,verifyPassword,createSession,revokeSession,userFromRequest,setSessionCookie,clearSessionCookie}=require('../auth');
r.post('/login',(req,res)=>{const email=normalizeEmail(req.body.email),password=String(req.body.password||'');if(!email||password.length<8)return res.status(400).json({error:'Valid email and password required'});const u=(readDb().users||[]).find(x=>normalizeEmail(x.email)===email&&['active','approved'].includes(x.status));if(!u||!verifyPassword(password,u.passwordHash))return res.status(401).json({error:'Invalid email or password'});const token=createSession(u.id);setSessionCookie(res,token);res.json({ok:true,user:{id:u.id,name:u.name,email:u.email,role:u.role}})});
r.post('/logout',(req,res)=>{revokeSession(req.cookies?.stm_session);clearSessionCookie(res);res.json({ok:true})});
r.get('/me',(req,res)=>{const u=userFromRequest(req);if(!u)return res.status(401).json({error:'Not signed in'});res.json({id:u.id,name:u.name,email:u.email,role:u.role})});
module.exports=r;
