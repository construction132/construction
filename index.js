//define needed variables for the projects
const mongoose = require("mongoose")
const uri = "mongodb+srv://constuction:As132456@cluster0.1my9htn.mongodb.net/construction";

const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);


connect()
async function connect() {
    try {
        console.log("is connecting")
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("connected to database succufully")

    }
    catch (error) {
        console.log(error)
    }
}

const User = require("./module/users");
const Project= require("./module/projects")
const { error } = require("console");


//publishing the website on localhost:4500
server.listen(4500, () => {
    console.log('Server is running on port 4500');
});



app.use(express.static("public"));


//getting pages
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/index.html", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/dashboard.html", function (req, res) {
    res.sendFile(__dirname + "/dashboard.html");
});

app.get("/New.html", function (req, res) {
    res.sendFile(__dirname + "/New.html");
});
app.get("/action.html", function (req, res) {
    res.sendFile(__dirname + "/action.html");
});

app.get("/statment.html", function (req, res) {
    res.sendFile(__dirname + "/statment.html");
});



io.on("connection", (socket) => {
    //console log when a client connects
    console.log("A new Client connected!")

    socket.on("login", async (data) => {
        const username = data.username;
        const password = data.password;
        try {
            const users = await User.find({ name: username, password: password });
            if (users.length === 0) {
                console.log("No user has been found");
                socket.emit("loginFailed", "username or password is incorrect");
                return;
            }
            const user = users[0];
            console.log(user)
            const loggedInUsername = user.name; // Use a different variable name here
            const path = "dashboard.html";
            socket.emit("loginSuccess", { username: loggedInUsername, path });
        } catch (error) {
            console.error(error);
            socket.emit("loginFailed", "an error occurred while trying to log in");
        }
    });

    socket.on("checkuser", async (data) => {
        console.log("hi")
        const username = data
        //check in the mongodb user schema if there is a name with this useranem\
        try {
            const users = await User.find({ name: username });
            if (users.length === 0) {
                socket.emit("goLogin", "index.html");
                return;
            }
        }
        catch (error) {
            console.log(error)
        }


    })

    socket.on("storeProject", async (data) => {
        console.log("in socket")
        abaa = data.abaaLoan
        umi = data.umiLoan
        project = data.projectname
        date = data.date

      

        // Create a new document and save it to the "projects" collection
        let newProject = new Project({
            project: project,
            abaaLoan: abaa,
            umiLoan: umi,
            date: date
        });
        // Check if a project with the given name already exists
        let existingProject = await Project.findOne({ project: project });

        if (existingProject) {
            console.log("found")
            socket.emit("projectRespones","There is an existed project with the same name")
        } else {
            
            let save = await newProject.save()
            socket.emit("projectRespones","project has been stored succesfuly")

        }
    })

    socket.on("removeProject", async(projectname) => {

        //remove from the project collection the project of the specifc projectname
        let deletee=await Project.deleteOne({ project:projectname })
        console.log(deletee)
        //if print if there was a project has been deleted or no 
        if(deletee.deletedCount==0)
            socket.emit("projectRespones","nothing has been deleted")
        else
            socket.emit("projectRespones","the project has beed removed successfully")

    })

    
    socket.on("getProjects", async() => {

       //get all the projects in the project table\
       const projects = await Project.find();
       console.log(projects)
       socket.emit("sendProjects",projects)
    })
    //socket on client disconnect
    socket.on("disconnect", () => {

        console.log(`Client disconnected`)
    })

})