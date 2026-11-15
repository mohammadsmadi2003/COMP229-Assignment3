import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'}));
app.use(express.json());
const secret = process.env.JWT_SECRET;
if (!secret || !process.env.MONGODB_URI) { console.error('Set MONGODB_URI and JWT_SECRET in .env'); process.exit(1); }
const userSchema = new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true},role:{type:String,enum:['user','admin'],default:'user'}},{timestamps:true});
const User = mongoose.model('User',userSchema);
const projectSchema = new mongoose.Schema({title:{type:String,required:true},description:String,technology:String,link:String,completion:String},{timestamps:true});
const educationSchema = new mongoose.Schema({school:{type:String,required:true},degree:String,field:String,startDate:String,endDate:String,description:String},{timestamps:true});
const contactSchema = new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true},message:{type:String,required:true}},{timestamps:true});
const Project=mongoose.model('Project',projectSchema), Education=mongoose.model('Education',educationSchema), Contact=mongoose.model('Contact',contactSchema);
const safeUser=u=>({id:u._id,name:u.name,email:u.email,role:u.role});
function tokenFor(u){return jwt.sign({id:String(u._id),role:u.role},secret,{expiresIn:'2h'});}
function authenticate(req,res,next){const header=req.headers.authorization||'';const token=header.startsWith('Bearer ')?header.slice(7):null;if(!token)return res.status(401).json({error:'Authentication required'});try{req.auth=jwt.verify(token,secret);next();}catch{return res.status(401).json({error:'Invalid or expired token'});}}
function adminOnly(req,res,next){if(req.auth.role!=='admin')return res.status(403).json({error:'Admin only'});next();}
const handle=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.post('/auth/signup',handle(async(req,res)=>{const {name,email,password}=req.body;if(!name||!email||!password||password.length<8)return res.status(400).json({error:'Name, email, and password (8+ characters) required'});if(await User.exists({email:email.toLowerCase().trim()}))return res.status(409).json({error:'Email already registered'});const user=await User.create({name,email,password:await bcrypt.hash(password,12),role:'user'});res.status(201).json({token:tokenFor(user),user:safeUser(user)});}));
app.post('/auth/signin',handle(async(req,res)=>{const {email,password}=req.body;const user=await User.findOne({email:String(email||'').toLowerCase().trim()});if(!user||!await bcrypt.compare(String(password||''),user.password))return res.status(401).json({error:'Invalid credentials'});res.json({token:tokenFor(user),user:safeUser(user)});}));
app.get('/auth/signout',(req,res)=>res.json({message:'Signed out. Remove token on client.'}));
app.get('/auth/me',authenticate,handle(async(req,res)=>{const user=await User.findById(req.auth.id);if(!user)return res.status(401).json({error:'User not found'});res.json(safeUser(user));}));
function crud(path,Model,{contact=false}={}){
 app.get('/api/'+path,handle(async(req,res)=>{const filter=contact?null:{};if(contact){authenticate(req,res,async()=>{if(req.auth.role!=='admin')return res.status(403).json({error:'Admin only'});try{res.json(await Model.find().sort({createdAt:-1}));}catch(e){res.status(500).json({error:e.message});}});return;}res.json(await Model.find(filter).sort({createdAt:-1}));}));
 app.get('/api/'+path+'/:id',handle(async(req,res)=>{if(contact){authenticate(req,res,async()=>{if(req.auth.role!=='admin')return res.status(403).json({error:'Admin only'});try{const d=await Model.findById(req.params.id);return d?res.json(d):res.status(404).json({error:'Not found'});}catch{res.status(400).json({error:'Invalid ID'});}});return;}const d=await Model.findById(req.params.id);return d?res.json(d):res.status(404).json({error:'Not found'});}));
 app.post('/api/'+path,...(contact?[]:[authenticate,adminOnly]),handle(async(req,res)=>{const d=await Model.create(req.body);res.status(201).json(d);}));
 app.put('/api/'+path+'/:id',authenticate,adminOnly,handle(async(req,res)=>{const d=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});return d?res.json(d):res.status(404).json({error:'Not found'});}));
 app.delete('/api/'+path+'/:id',authenticate,adminOnly,handle(async(req,res)=>{const d=await Model.findByIdAndDelete(req.params.id);return d?res.json({message:'Deleted'}):res.status(404).json({error:'Not found'});}));
 app.delete('/api/'+path,authenticate,adminOnly,handle(async(req,res)=>{const result=await Model.deleteMany({});res.json({deletedCount:result.deletedCount});}));
}
crud('projects',Project);crud('educations',Education);crud('contacts',Contact,{contact:true});
app.use((err,req,res,next)=>{console.error(err);if(err.name==='ValidationError')return res.status(400).json({error:err.message});if(err.name==='CastError')return res.status(400).json({error:'Invalid ID'});if(err.code===11000)return res.status(409).json({error:'Duplicate value'});res.status(500).json({error:'Server error'});});
async function start(){await mongoose.connect(process.env.MONGODB_URI);console.log('Connected to MongoDB');if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){const email=process.env.ADMIN_EMAIL.toLowerCase().trim();const password=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);await User.findOneAndUpdate({email},{$set:{name:'Portfolio Admin',password,role:'admin'}},{upsert:true,new:true,setDefaultsOnInsert:true});console.log('Admin account ready');}app.listen(Number(process.env.PORT)||3000,()=>console.log('Server on port '+(process.env.PORT||3000)));}
start().catch(e=>{console.error('Startup failed:',e.message);process.exit(1)});
