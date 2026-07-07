const express=require("express");
const app=express(); 
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const MONGO_URL = process.env.MONGO_URL ||
"mongodb://priyanshurajyadav56_db_user:priyanshu123@ac-hezwv21-shard-00-00.htu9dqn.mongodb.net:27017,ac-hezwv21-shard-00-01.htu9dqn.mongodb.net:27017,ac-hezwv21-shard-00-02.htu9dqn.mongodb.net:27017/?tls=true&replicaSet=atlas-7q1t7e-shard-0&authSource=admin&retryWrites=true&w=majority";
const PORT = process.env.PORT || 8080;
const DEFAULT_LISTING_IMAGE = "/images/fallback-listing.svg";
main()
 .then(()=>{
  console.log("con to db");
 })

 .catch((err)=>{
  console.log(err);

 });
async function main(){
  await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.locals.getListingImageUrl = (listing) => {
  const imageUrl = listing?.image?.url;
  return typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : DEFAULT_LISTING_IMAGE;
};



app.get("/",(req ,res)=>{
  res.redirect("/listings");

});

app.get("/privacy",(req ,res)=>{
  res.render("pages/privacy.ejs");
});

app.get("/term",(req ,res)=>{
  res.render("pages/term.ejs");
});

app.use(passport.initialize());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/demouser",async(req ,res)=>{
  let fakeUser= new User({
    email: "pxy@gmail.com",
    username:"xyz"

  });
  let registerUser= await User.register(fakeUser,"helloWorld");
  res.send(registerUser);
});
//Index route

app.get("/listings",async(req ,res )=>
{
  const allListing=await Listing.find({});
  res.render("listings/index.ejs", { allListing });

  });
  app.get("/listings/new",(req ,res)=>{
    res.render("listings/new.ejs")

  });



  //show route

  app.get("/listings/:id",async(req ,res)=>{
   let{id}=req.params;
   const listing=await Listing.findById(id);
   if (!listing) {
    return res.redirect("/listings");
   }
   res.render("listings/show.ejs",{listing})



  });
  //create route
  app.post("/listings",async(req,res)=>{
  const newListing=new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings")
  


  });

  //edit route
  app.get("/listings/:id/edit",async(req , res)=>{

    let{id}=req.params;
   const listing=await Listing.findById(id);
   if (!listing) {
    return res.redirect("/listings");
   }
   res.render("listings/edit.ejs",{listing});

  });

  app.put("/listings/:id", async(req ,res )=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings")

  });

  app.delete("/listings/:id", async (req ,res)=>{
    let {id}=req.params;
    
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings")


  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something went wrong. Please make sure MongoDB is running, then refresh the page.");
  });

  

// app.get("/testListing",async (req,res)=>{
//   let sampleListing= new Listing({
//   title:"My New Villa",
//   description:"By the Beach",
//   price:1200,
//   location:"Goa",
//   country:"India"


//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("sucessful testing");
 


// });
app.listen(PORT ,()=>{
  console.log(`port is listening on ${PORT}`)
});
