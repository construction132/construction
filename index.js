//define needed variables for the projects
const mongoose = require("mongoose")
const uri = "mongodb+srv://constuction:As132456@cluster0.1my9htn.mongodb.net/construction";

const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const User = require("./module/users.js");
const Project = require("./module/projects.js")
const statment = require("./classes/statment.js")
const Action = require("./module/actions.js")


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
            const loggedInUsername = user.name;
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
            socket.emit("projectRespones", "There is an existed project with the same name")
        } else {

            let save = await newProject.save()
            socket.emit("projectRespones", "project has been stored succesfuly")

        }

        startAction({ date, abaa, umi, project })

    })

    socket.on("removeProject", async (projectname) => {

        //remove from the project collection the project of the specifc projectname
        let deletee = await Project.deleteOne({ project: projectname })
        console.log(deletee)
        //if print if there was a project has been deleted or no 
        if (deletee.deletedCount == 0)
            socket.emit("projectRespones", "nothing has been deleted")
        else
            socket.emit("projectRespones", "the project has beed removed successfully")

    })


    socket.on("getProjects", async () => {

        //get all the projects in the project table\
        const projects = await Project.find();
        socket.emit("sendProjects", projects)
    })


    socket.on("addAction", async (data) => {
        let date1 = data.date1
        let abaaIn = data.abaaIn
        let umiIn = data.umiIn
        let Cash = data.Cash
        let rent = data.rent
        let abaapercentage = data.abaapercentage
        let umipercentage = data.umipercentage
        let UmiOut = data.UmiOut
        let AbaaOut = data.AbaaOut
        let projectOwner = data.projectOwner
        let abaaSource= data.abaaSource
        let umiSource=data.umiSource
        //retrive the project from the database that has name of projectowner
        let owner = {};
        try {
            owner = await Action.find({ owner: projectOwner })
        } catch (err) {
            console.log("there is an error happened")
            return
        }   

        console.log("the owner is " + owner[owner.length-1].remainingAbaa+ "p owner "+projectOwner)
        try {
            let newstatment = new statment(owner[owner.length-1].remainingAbaa, owner[owner.length-1].remainingUmi, abaaIn, umiIn, rent, Cash, abaapercentage, umipercentage, AbaaOut, UmiOut, date1,owner[owner.length-1].abaaTotal,owner[owner.length-1].umiTotal)

            let done = await newstatment.calculateRemainingLoan()
            let newAction = new Action({
                actionNumber: owner.length+1,
                owner: projectOwner,
                abaaLoan: newstatment.abaaLoan,
                umiLoan: newstatment.umiLoan,
                abaaIn: newstatment.abaaIn,
                abaaSource:abaaSource,
                umiIn: newstatment.umiIn,
                umiSource:umiSource,
                rent: newstatment.rent,
                cash: newstatment.cash,
                cashShling: newstatment.cashShling,
                abaaPercentage: newstatment.abaaPercentage,
                umiPercentage: newstatment.umiPercentage,
                total: newstatment.total,
                abaaOut: newstatment.abaaOut,
                umiOut: newstatment.umiOut,
                abaaTotal: newstatment.abaaTotal,
                umiTotal: newstatment.umiTotal,
                remainingAbaa: newstatment.remainingAbaa,
                remainingUmi: newstatment.remainingUmi,
                remainingTotal: newstatment.remainingTotal,
                shlingFactor: newstatment.shlingFactor,
                date: newstatment.date
            });
            let save = await newAction.save()

        }
        catch (error) {
            console.log(error)
        }


    })


     socket.on("getspecificProject", async(name) => {

        let action = {};
        try {
            action = await Action.find({ owner: name })
        } catch (err) {
            console.log("there is an error happened")
            return
        }
        socket.emit("sendActions",action)  
    })

    
    //socket on client disconnect
    socket.on("disconnect", () => {

        console.log(`Client disconnected`)
    })

})


async function startAction(data)
{
    console.log("got the emit")
    let date = data.date;
    let abaa = data.abaa
    let umi = data.umi
    let project = data.project
    console.log("starting action")

    let newAction = new Action({
        actionNumber: 1,
        owner: project,
        abaaLoan: abaa,
        umiLoan: umi,
        abaaIn: 0,
        umiIn: 0,
        rent: 0,
        cash: 0,
        cashShling: 0,
        abaaPercentage: 0,
        umiPercentage: 0,
        total: 0,
        abaaOut: 0,
        umiOut: 0,
        abaaTotal: 0,
        umiTotal: 0,
        remainingAbaa: abaa,
        remainingUmi: umi,
        remainingTotal: abaa+umi,
        shlingFactor: 0,
        date: date
    });
    let save = await newAction.save()
    console.log("action has started")
}