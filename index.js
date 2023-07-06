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
const loans = require("./module/loans.js")
const loanAction = require("./module/loanAction.js")
const Loan = require("./classes/Loan.js")

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
        console.log("name is " + username + " password is " + password)
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
        omar = data.omarLoan
        rageeb = data.rageebLoan
        project = data.projectname
        date = data.date

        // Create a new document and save it to the "projects" collection
        let newProject = new Project({
            project: project,
            abaaLoan: abaa,
            umiLoan: umi,
            rageebLoan: rageeb,
            omarLoan: omar,
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
        startLoan({ date, omar, rageeb, project })

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
        let date1 = data.date
        let abaaIn = data.abaaIn
        let umiIn = data.umiIn
        let Cash = data.Cash
        let rent = data.rent
        let abaaLoneDecrease = data.abaaLoan
        let umiLoneDecrease = data.umiLoan
        let outSource = data.outSource
        let UmiOut = data.UmiOut
        let AbaaOut = data.AbaaOut
        let projectOwner = data.projectOwner
        let abaaSource = data.abaaSource
        let umiSource = data.umiSource
        let umiTo = data.umiTo
        let abaaTo = data.abaaTo

        console.log("umi decrese is  ", umiLoneDecrease)
        //retrive the project from the database that has name of projectowner
        let owner = {};
        try {
            owner = await Action.find({ owner: projectOwner })
        } catch (err) {
            console.log("there is an error happened")
            return
        }

        console.log("the owner is " + owner[owner.length - 1].remainingAbaa + "p owner " + projectOwner)
        try {
            let newstatment = new statment(owner[owner.length - 1].remainingAbaa, owner[owner.length - 1].remainingUmi, abaaIn, umiIn, rent, Cash, abaaLoneDecrease, umiLoneDecrease, AbaaOut, UmiOut, date1, owner[owner.length - 1].abaaTotal, owner[owner.length - 1].umiTotal)

            let done = await newstatment.calculateRemainingLoan()
            let newAction = new Action({
                actionNumber: owner.length + 1,
                owner: projectOwner,
                abaaLoan: newstatment.abaaLoan,
                umiLoan: newstatment.umiLoan,
                abaaIn: newstatment.abaaIn,
                abaaSource: abaaSource,
                umiIn: newstatment.umiIn,
                umiSource: umiSource,
                rent: newstatment.rent,
                cash: newstatment.cash,
                cashShling: newstatment.cashShling,
                abaaLoneDecrease: newstatment.abaaLoneDecrease,
                umiLoneDecrease: newstatment.umiLoneDecrease,
                total: newstatment.total,
                abaaOut: newstatment.abaaOut,
                umiOut: newstatment.umiOut,
                outSource: outSource,
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

        //get the privous action loans
        try {
            let omarLoan = await loanAction.find({ loaner: "omar", project: projectOwner })
            let rageebLoan = await loanAction.find({ loaner: "rageeb", project: projectOwner })
            console.log("omar is "+ omarLoan)
            console.log("rageeb is "+ rageebLoan)
            //making the action of the loan
            console.log("in try umi to is "+umiTo+" abaa to is "+abaaTo)
            if (umiTo === abaaTo&&umiTo==="omar") {
                let pay = new Loan(omarLoan[omarLoan.length-1].remaining, omarLoan[omarLoan.length-1].abaa, omarLoan[omarLoan.length-1].umi, omarLoan[omarLoan.length-1].UAE, omarLoan[omarLoan.length-1].house, omarLoan[omarLoan.length-1].swafia, abaaIn, umiIn, abaaSource, umiSource, "omar",projectOwner,date1)
               
                let store = await storeActionLoan(pay)
            }
            else if (umiTo === abaaTo&&umiTo==="rageeb")
            {
                let pay = new Loan(rageebLoan[rageebLoan.length-1].remaining, rageebLoan[rageebLoan.length-1].abaa, rageebLoan[rageebLoan.length-1].umi, rageebLoan[rageebLoan.length-1].UAE, rageebLoan[rageebLoan.length-1].house, rageebLoan[rageebLoan.length-1].swafia, abaaIn, umiIn, abaaSource, umiSource, "rageeb",projectOwner,date1)
                let store = await storeActionLoan(pay)
            }
            else if (umiTo!==abaaTo)
            {
                if(umiTo==="omar")
                {
                    let pay = new Loan(omarLoan[omarLoan.length-1].remaining, omarLoan[omarLoan.length-1].abaa, omarLoan[omarLoan.length-1].umi, omarLoan[omarLoan.length-1].UAE, omarLoan[omarLoan.length-1].house, omarLoan[omarLoan.length-1].swafia, 0, umiIn, "", umiSource, "omar",projectOwner,date1)
                   
                    let store = await storeActionLoan(pay)
                }
                else if (umiTo==="rageeb")
                {
                    let pay = new Loan(rageebLoan[rageebLoan.length-1].remaining, rageebLoan[rageebLoan.length-1].abaa, rageebLoan[rageebLoan.length-1].umi, rageebLoan[rageebLoan.length-1].UAE, rageebLoan[rageebLoan.length-1].house, rageebLoan[rageebLoan.length-1].swafia, 0, umiIn, "", umiSource, "rageeb",projectOwner,date1)
                   
                    let store = await storeActionLoan(pay)
                }
                if(abaaTo==="omar")
                {
                    let pay = new Loan(omarLoan[omarLoan.length-1].remaining, omarLoan[omarLoan.length-1].abaa, omarLoan[omarLoan.length-1].umi, omarLoan[omarLoan.length-1].UAE, omarLoan[omarLoan.length-1].house, omarLoan[omarLoan.length-1].swafia, abaaIn, 0, abaaSource, "", "omar",projectOwner,date1)
                   
                    let store = await storeActionLoan(pay)
                }
                else if (abaaTo==="rageeb")
                {
                    let pay = new Loan(rageebLoan[rageebLoan.length-1].remaining, rageebLoan[rageebLoan.length-1].abaa, rageebLoan[rageebLoan.length-1].umi, rageebLoan[rageebLoan.length-1].UAE, rageebLoan[rageebLoan.length-1].house, rageebLoan[rageebLoan.length-1].swafia, abaaIn, 0, abaaSource, "", "rageeb",projectOwner,date1)
                   
                    let store = await storeActionLoan(pay)
                }
            }
        }
        catch (error) {
            console.log(error)
        }



    })


    socket.on("getspecificProject", async (name) => {

        let action = {};
        try {
            action = await Action.find({ owner: name })
        } catch (err) {
            console.log("there is an error happened")
            return
        }
        socket.emit("sendActions", action)
    })

    socket.on('gettotal', async (cash, rent, callback) => {
        console.log("in total")
        try {
            const factor = await getfactor();
            // Add the cash and rent together
            const total = cash * factor + rent;

            // Return the total to the client using the provided callback function
            callback(total);
        } catch (error) {
            console.error(error);
            callback(0); // Return 0 to the client in case of an error
        }
    });

    //socket on client disconnect
    socket.on("disconnect", () => {

        console.log(`Client disconnected`)
    })

})

async function getfactor() {
    console.log("calculating factor");
    const apiKey = '9179c0f0f66c44909ffeb3444ab800dc';
    const fromCurrency = 'SAR';
    const toCurrency = 'KES';

    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=${toCurrency},${fromCurrency}`);
    const data = await response.json();

    if (data.error) {
        throw new Error(`Error: ${data.error.message}`);
    }

    let factor = data.rates[fromCurrency] * 10;
    console.log(this.shlingFactor)
    return factor;

}

async function startAction(data) {
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
        abaaLoneDecrease: 0,
        umiLoneDecrease: 0,
        total: 0,
        abaaOut: 0,
        umiOut: 0,
        abaaTotal: 0,
        umiTotal: 0,
        remainingAbaa: abaa,
        remainingUmi: umi,
        remainingTotal: abaa + umi,
        shlingFactor: 0,
        date: date
    });
    let save = await newAction.save()
    console.log("action has started")
}

async function startLoan(data) {
    console.log("got the emit")
    let date = data.date;
    let omar = data.omar
    let rageeb = data.rageeb
    let project = data.project

    let rageebLoan = new loans({
        project: project,
        StartingLoan: rageeb,
        loaner: "rageeb",
        date: date,
    });
    let omarLoan = new loans({
        project: project,
        loaner: "omar",
        StartingLoan: omar,
        date: date,
    });
    let save = await rageebLoan.save()
    save = await omarLoan.save()

    await StartLoanAction({ date, loaner: "omar", startLoan: omar, project })
    await StartLoanAction({ date, loaner: "rageeb", startLoan: rageeb, project })

}

async function StartLoanAction(data) {
    let date = data.date;
    let loaner = data.loaner
    let startingLoan = data.startLoan
    let project = data.project
    let umi = 0
    let abaa = 0
    let swafia = 0
    let UAE = 0
    let house = 0
    if (data.umi)
        umi = data.umi
    if (data.abaa)
        abaa = data.abaa
    if (data.swafia)
        swafia = data.swafia
    if (data.UAE)
        UAE = data.UAE
    if (data.house)
        house = data.house

    let newLoanAction = new loanAction({
        project: project,
        loaner: loaner,
        date: date,
        startingLoan: startingLoan,
        umi: umi,
        paid: 0,
        abaa: abaa,
        house: house,
        UAE: UAE,
        swafia: swafia,
        total: 0,
        remaining: startingLoan
    })
    let save = await newLoanAction.save()
}

async function  storeActionLoan(pay)
{
    console.log("in saving")
    let done = await pay.calculateRemaining(pay.Pay1,pay.Pay2,pay.Pay1Source,pay.Pay2Source,pay.totalAbaa,pay.totalUmi,pay.totalUAE,pay.totalhouse,pay.totalSwafia)
    let newLoanAction = new loanAction({
        project: pay.projectOwner,
        loaner: pay.loaner,
        date:pay.date,
        startingLoan: pay.originalLoan,
        umi: pay.totalUmi,
        paid: pay.totalPay,
        abaa: pay.totalAbaa,
        house: pay.totalhouse,
        UAE: pay.totalUAE,
        swafia: pay.totalSwafia,
        total: pay.total,
        remaining: pay.remaining
    })

    try
    {
        let save = await newLoanAction.save()
    }
    catch(error )
    {
        console.log(error)
    }
    return true
}
   