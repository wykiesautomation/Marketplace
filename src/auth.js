const crypto=require('crypto');
const config=require('./config');
const{readDb,writeDb}=require('./db');
const SESSION_COOKIE='stm_session';
function normalizeEmail(v){return String(v||'').trim().toLowerCase()}
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){const hash=crypto.scryptSync(String(password),salt,64).toString('hex');return `scrypt$${salt}$${hash}`}
function verifyPassword(password,stored){const parts=String(stored||'').split('$');if(parts.length!==3||parts[0]!=='scrypt')return false;const actual=crypto.scryptSync(String(password),parts[1],64);const expected=Buffer.from(parts[2],'hex');return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected)}
function createSession(userId){const db=readDb();db.sessions=db.sessions||[];db.sessions=db.sessions.filter(x=>new Date(x.expiresAt)>new Date());const token=crypto.randomBytes(32).toString('hex');db.sessions.push({id:'sess_'+Date.now(),tokenHash:crypto.createHash('sha256').update(token).digest('hex'),userId,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+8*60*60*1000).toISOString()});writeDb(db);return token}
function revokeSession(token){if(!token)return;const db=readDb(),h=crypto.createHash('sha256').update(token).digest('hex');db.sessions=(db.sessions||[]).filter(x=>x.tokenHash!==h);writeDb(db)}
function userFromRequest(req){const token=req.cookies?.[SESSION_COOKIE];if(!token)return null;const db=readDb(),h=crypto.createHash('sha256').update(token).digest('hex');const s=(db.sessions||[]).find(x=>x.tokenHash===h&&new Date(x.expiresAt)>new Date());if(!s)return null;return(db.users||[]).find(x=>x.id===s.userId&&['active','approved'].includes(x.status))||null}
function setSessionCookie(res,token){res.setHeader('Set-Cookie',`${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${config.nodeEnv==='production'?'; Secure':''}`)}
function clearSessionCookie(res){res.setHeader('Set-Cookie',`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${config.nodeEnv==='production'?'; Secure':''}`)}
function requireRole(role){return(req,res,next)=>{const u=userFromRequest(req);if(!u||u.role!==role)return res.status(401).json({error:'Secure login required'});req.currentUser=u;next()}}
module.exports={normalizeEmail,hashPassword,verifyPassword,createSession,revokeSession,userFromRequest,setSessionCookie,clearSessionCookie,requireRole};
