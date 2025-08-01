import mongoose from "mongoose";

const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMs: 45000,
    family: 4
}

async function connect(){
    const dbUri = process.env.DATABASE;
    try{
        if(mongoose.connection.readyState != 1){
            await mongoose.connect(dbUri ,options);
            console.log("Database Connect successfully");
        }else{
            console.log("Database already connected!");
        }
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}

export default connect;