module.exports = app => {
  
  
  const express = require("express");
  const jwt=require('jsonwebtoken');
  const AdminUser=require('../../models/AdminUser');
  const assert=require('http-assert');
  //登录校验中间件引用
const authValid =  require('../../middleware/authValid');
//资源获取中间键
const resourceGet = require('../../middleware/resourceGet');


  const router = express.Router({
    mergeParams: true
  });
//新建资源
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });
//资源列表
  router.get("/", async (req, res) => {
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find()
      .setOptions(queryOptions)
      .limit(100);
    res.send(items);
  });
//资源详情
  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });

  router.put("/:id", async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });

  router.delete("/:id", async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body);
    res.send({
      success: true
    });
  });




app.use("/admin/api/rest/:resource",authValid(),resourceGet(),router)


const multer  = require('multer')
const upload = multer({dest:__dirname+'/../../uploads'})
  app.post('/admin/api/upload',authValid(),upload.single('file'),async(req,res,next)=>{
   const file  = req.file
   file.url=`http://localhost:3000/uploads/${file.filename}`
   res.send(file)
  })

  app.post('/admin/api/login', async (req, res) => {
    
    const { username, password } = req.body
    // 1.根据用户名找用户
    
    const user = await AdminUser.findOne({ username }).select('+password')
    const name=user.username
    assert(user,422,'用户不存在')
    // if (!user) {
    //   return res.status(422).send({
    //     message:'用户不存在'
    //   })
    // } 
    //2.校验密码
    const isValid=  require('bcryptjs').compareSync(password,user.password)
    assert(isValid,422,'密码错误')
    // if (!isValid) {
    //   return res.status(422).send({
    //     message:'密码错误'
    //   })
    // } 
    //返回token

    const token =  jwt.sign({id:user._id},app.get('SECRET'))
    res.send({ name,token })
      
      
  })

  


  //错误处理
  app.use(async (err,req,res,next)=>{
    res.status(err.statusCode || 500).send({
      message:err.message
    })
  })

  
}
