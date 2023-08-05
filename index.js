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
const statment2 = require("./classes/statment2.js")
const Action = require("./module/actions.js")
const loans = require("./module/loans.js")
const loanAction = require("./module/loanAction.js")
const Loan = require("./classes/Loan.js")
const addLoan = require("./classes/addLoan.js")


const ProjectObject = require("./module/projectsobject.js")
const ActionObject = require("./module/actionsobject.js");
const actionsobject = require("./module/actionsobject.js");


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

app.get("/loan.html", function (req, res) {
    res.sendFile(__dirname + "/loan.html");
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
        let loans = data.loans
        project = data.projectname
        date = data.date
        // Create a new document and save it to the "projects" collection
        let newProject = new ProjectObject({
            project: project,
            loans: loans,
            date: date
        });
        // Check if a project with the given name already exists
        let existingProject = await ProjectObject.findOne({ project: project });

        if (existingProject) {
            console.log("found")
            socket.emit("projectRespones", "There is an existed project with the same name")
        } else {

            let save = await newProject.save()
            socket.emit("projectRespones", "project has been stored succesfuly")

        }

        startAction({ date, loans, project, loans })
        startLoan({ date, loans, project })

    })

    socket.on("removeProject", async (projectname) => {
        let counter = 0;
        try {
            //remove from the project collection the project of the specifc projectname
            let deletee = await ProjectObject.deleteMany({ project: projectname })
            counter++
        } catch (error) {
            console.log(error)
        }
        try {
            //remove from the project collection the project of the specifc projectname
            let deletee = await loanAction.deleteMany({ project: projectname })
            counter++
        } catch (error) {
            console.log(error)
        }
        try {
            //remove from the project collection the project of the specifc projectname
            let deletee = await loans.deleteMany({ project: projectname })
            counter++
        } catch (error) {
            console.log(error)
        }

        try {
            //remove from the project collection the project of the specifc projectname
            let deletee = await ActionObject.deleteMany({ owner: projectname })
            counter++
        } catch (error) {
            console.log(error)
        }
        if (counter === 4) {
            socket.emit("projectRespones", "project has been deleted")
            //get all the projects in the project table\
            const projects = await ProjectObject.find();
            socket.emit("sendProjects", projects)
        }

    })


    socket.on("getProjects", async () => {

        //get all the projects in the project table\
        const projects = await ProjectObject.find();
        socket.emit("sendProjects", projects)
    })

    socket.on("getLoaners", async (data) => {
        let project = data.project
        console.log(project)
        try {
            let loaners = await ProjectObject.findOne({ project: project })
            console.log(loaners)
            socket.emit("sendLoaners", { loaners })
        } catch (error) {
            console.log(error)
        }

    })
    socket.on("addAction", async (data) => {
        let date1 = data.date
        let value = data.value
        let source = data.source
        let giver = data.giver
        let projectOwner = data.projectOwner
        let purpose = data.purpose
        let actionType = data.actionType

        //retrive the project from the database that has name of projectowner


        let to = data.to
        let to2 = data.to2
        let endtaker = ""
        let projectto=""
        let loanerto=""
        if(to==="other")
        {
            endtaker=to2
        }
        else if (actionType === "cash out") {
             [projectto, loanerto] = to.split('/');

            if (projectto === projectOwner) {
                endtaker = loanerto
            }
            else {
                endtaker = to2
            }
        }
        else if (actionType === "cash in")
            endtaker = to



        try {


            let owner = await ActionObject.find({ owner: projectOwner })
            let newstatment = new statment(owner[owner.length - 1].remainingLoans, value, source, giver, endtaker, purpose, date1, owner[owner.length - 1].totalRemaining, owner[owner.length - 1].totalPaid, actionType)
            await newstatment.calculateRemainingLoan()
            console.log("the statment source is "+ source)
            let newAction = new ActionObject({
                actionNumber: owner.length + 1,
                owner: projectOwner,
                actionType: newstatment.actionType,
                loans: newstatment.loans,
                value: newstatment.value,
                giver: newstatment.giver,
                source: newstatment.source,
                taker: newstatment.taker,
                purpose: newstatment.purpose,
                remainingLoans: newstatment.remaining,
                totalRemaining: newstatment.remainingTotal,
                totalPaid: newstatment.totalPaid,
                shlingFactor: newstatment.shlingFactor,
                date: newstatment.date
            });
            await newAction.save()



            //doing the second calculation if the pay wasnt for the same loan 
            if (actionType === "cash out") {
                if (projectto !== projectOwner&&to!=="other") {
                    let owner = await ActionObject.find({ owner: projectto })
                    let newstatment = new statment2(owner[owner.length - 1].remainingLoans, value, "from " + projectOwner + " to " + loanerto, giver, to2, loanerto, purpose, date1, owner[owner.length - 1].totalRemaining, owner[owner.length - 1].totalPaid, actionType)

                    await newstatment.calculateRemainingLoan()
                    let newAction = new ActionObject({
                        actionNumber: owner.length + 1,
                        owner: projectto,
                        actionType: newstatment.actionType,
                        loans: newstatment.loans,
                        value: newstatment.value,
                        giver: newstatment.giver,
                        source: newstatment.source,
                        taker: loanerto,
                        purpose: newstatment.purpose,
                        remainingLoans: newstatment.remaining,
                        totalRemaining: newstatment.remainingTotal,
                        totalPaid: newstatment.totalPaid,
                        shlingFactor: newstatment.shlingFactor,
                        date: newstatment.date
                    });
                    await newAction.save()
                    
                    console.log("the end taker is "+loanerto)
                    let loanACtions = await loanAction.find({ loaner: endtaker, project: projectto })
                    let loan = new Loan(loanACtions[loanACtions.length - 1].remaining, loanACtions[loanACtions.length - 1].source, value, projectOwner, loanerto, projectto, date1)
                    await storeActionLoan(loan)

                    try {


                        let loanACtions = await loanAction.find({ loaner: to2, project: projectto })
                        let loan = new Loan(loanACtions[loanACtions.length - 1].remaining, loanACtions[loanACtions.length - 1].source, value * -1, projectOwner, to2, projectto, date1)
                        await storeActionLoan(loan)
                    } catch (error) {
                        console.log(error)
                    }
                }

            }




        }
        catch (error) {
            console.log(error)
            socket.emit("addedAction", "an error happened while trying to add action")
        }



        //make loan actions
        let loanACtions = await loanAction.find({ loaner: endtaker, project: projectOwner })
        let loan = new Loan(loanACtions[loanACtions.length - 1].remaining, loanACtions[loanACtions.length - 1].source, value, projectOwner, endtaker, projectOwner, date1)
        await storeActionLoan(loan)
      


        if (actionType === "cash in") {

          

            try {

                
                let loanACtions = await loanAction.find({ loaner: giver, project: projectOwner })
                let loan = new Loan(loanACtions[loanACtions.length - 1].remaining, loanACtions[loanACtions.length - 1].source, value * -1, source, giver, projectOwner, date1)
                await storeActionLoan(loan)
            } catch (error) {
                console.log(error)
            }
        }

        socket.emit("addedAction", "action has been stored")
        // //get the privous action loans
        // try {
        //     let loanACtions = []

        //     loanACtions = await loanAction.find({ loaner:to, project: projectOwner })


        //     let loan = new Loan(loanACtions[loanACtions.length - 1].remaining, loanACtions[loanACtions.length - 1].abaa, loanACtions[loanACtions.length - 1].umi, loanACtions[loanACtions.length - 1].UAE, loanACtions[loanACtions.length - 1].house, loanACtions[loanACtions.length - 1].swafia, value, source, to, projectOwner, date1)
        //     await storeActionLoan(loan)

        //     if (actionType === "cash in") {

        //         console.log("in if ")
        //         if (giver === "abaa") {
        //             console.log("in abaa ")
        //             loanACtions = await loanAction.find({ loaner: "abaa", project: projectOwner })
        //         }
        //         else if (giver === "umi") {
        //             console.log("in umi ")
        //             loanACtions = await loanAction.find({ loaner: "umi", project: projectOwner })
        //         }
        //         let loan = new Loan(loanACtions[loanACtions.length - 1].remaining, loanACtions[loanACtions.length - 1].abaa, loanACtions[loanACtions.length - 1].umi, loanACtions[loanACtions.length - 1].UAE, loanACtions[loanACtions.length - 1].house, loanACtions[loanACtions.length - 1].swafia, value * -1, source, loanACtions[loanACtions.length - 1].loaner, projectOwner, date1, "giver")
        //         let save = await storeActionLoan(loan)
        //     }

        //     socket.emit("addedAction", "Action has been stored succsufully")
        // }
        // catch (error) {
        //     console.log(error)
        //     socket.emit("addedAction", "an error happened while trying to add action")
        // }



    })


    socket.on("getspecificProject", async (name) => {

        let action = [];
        try {
            action = await ActionObject.find({ owner: name })
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

    socket.on("getLoanAction", async (data) => {

        let loaner = data.loaner
        let project = data.project
        console.log(loaner)
        console.log(project)

        try {
            let actions = await loanAction.find({ loaner: loaner, project: project })
            console.log(actions)
            socket.emit("sendLoanAction", actions)
        } catch (error) {
            console.log(error)
        }
    })

    socket.on("deleteLastAction", async (project) => {

        let actions = await ActionObject.find({ owner: project });
        console.log("hey")
        let source=""
        let taker=""
        let to = ""
        if (actions.length > 1) {
            console.log("hey2")
            let lastAction = actions.pop();
            source= lastAction.source
            taker=lastAction.taker
            console.log(lastAction)
            try {

                await ActionObject.deleteOne({ "actionNumber": lastAction.actionNumber });
                console.log("hello")
                socket.emit("sendActions", actions)
            } catch (error) {
                console.log("in error 1")
                console.log(error)
            }
            try {
                
                    let lastLoanAction = await loanAction.find({ "loaner": lastAction.taker });
                    if (lastLoanAction) {
                        await loanAction.deleteOne({ "_id": lastLoanAction[lastLoanAction.length-1]._id });
                        console.log("before the if")
                        if(lastLoanAction.length===1)
                        {
                            console.log("in the if")
                            let baseProject=await ProjectObject.findOne({project:project})
                            delete baseProject.loans[lastAction.taker]
                            console.log(baseProject.loans)
                            await ProjectObject.updateOne({ project: project }, { $set: { loans: baseProject.loans } });
                        }
                    }
                    console.log("hello")

                    if (source.startsWith("from")) {
                        let words = source.split(" "); // Split the string by spaces to get an array of words
                        to = words[words.length - 1]; // Access the last element of the array
                        let lastLoanAction = await loanAction.findOne({ "loaner": to }).sort({ _id: -1 });
                        if (lastLoanAction) {
                            await loanAction.deleteOne({ "_id": lastLoanAction._id });
                        }
                        console.log("hello")
                      }
             
            } catch (error) {
                console.log("in error 2")
                console.log(error)
            }


        }

    })

    socket.on("editAction", async (data) => {
        let actionNumber = data["N"]
        let abaaLoan = data["abaa Loan"]
        let umiLoan = data["umi Loan"]
        let abaaIn = data["abaa In"]
        let umiIn = data["umi In"]
        let abaaSource = data["abaa Source"]
        let umiSource = data["umi Source"]
        let rent = data["rent"]
        let cash = data["cash"]
        let cashShling = data["cash Shling"]
        let total = data["total"]
        let abaaOut = data["abaa Out"]
        let umiOut = data["umi Out"]
        let outSource = data["out Source"]
        let abaaTotal = data["abaa Total"]
        let umiTotal = data["umi Total"]
        let remainingAbaa = data["remaining Abaa"]
        let remainingUmi = data["remaining Umi"]
        let remainingTotal = data["remaining Parent"]
        let remainingTotalTotal = data["remaining Total"]
        let totalTotal = data["total Paid"]
        let date = data["date"]
        let projectOwner = data["projectOwner"]
        console.log(actionNumber)
        let actions = {}
        try {
            //get all the actions that bigger than or equal to the curruent action number 
            actions = await Action.updateOne({ owner: projectOwner, actionNumber: actionNumber }, { $set: { abaaLoan: abaaLoan, umiLoan: umiLoan, abaaIn: abaaIn, umiIn: umiIn, abaaSource: abaaSource, umiSource: umiSource, rent: rent, cash: cash, cashShling: cashShling, total: total, abaaOut: abaaOut, umiOut: umiOut, outSource: outSource, abaaTotal: abaaTotal, umiTotal: umiTotal, remainingAbaa: remainingAbaa, remainingUmi: remainingUmi, remainingTotalTotal: remainingTotalTotal, totalTotal: totalTotal, remainingTotal: remainingTotal, date, date } })

        } catch (error) {
            console.log(error)
        }

        try {
            let Actions = await ActionObject.find({ owner: projectOwner })
            socket.emit("sendUpdatedActions", Actions)

        } catch (error) {
            console.log(error)
        }

    })

    //update omar and rageen loan
    socket.on("changeLoan", async (data) => {
        let loaner = data.loanerChange
        let loan = data.Loan
        let projectOwner = data.projectOwner
        try {
            let action = await loanAction.updateOne({ project: projectOwner, loaner: loaner }, { $set: { StartingLoan: loan } }, { sort: { _id: -1 }, limit: 1 })
        }
        catch (error) {
            console.log(error)
            return
        }

    })

    socket.on("getTakers", async (data) => {
        let owner = data.projectOwner

        let projects = await ProjectObject.find({});
        let result = [];

        for (let i = 0; i < projects.length; i++) {
            let project = projects[i];
            let owner = project.project;
            let loans = project.loans;

            for (let loaner in loans) {
                result.push(`${owner}/${loaner}`);
            }
        }
        result.push(`other`);
        console.log(result)
        socket.emit("sendTakers", { result })
    })


    socket.on("addLoan", async (data) => {
        console.log("activated")
        let value = data.value
        let loaner = data.loaner
        let type = data.type
        let projectOwner = data.projectOwner
        let date = data.date
        console.log(" the value is " + value)

        let privous = await ProjectObject.findOne({ project: projectOwner })

        if (type === "existed" || privous.loans.hasOwnProperty(loaner)) {
            console.log("if")
            let actions = await ActionObject.findOne({ owner: projectOwner }).sort({ _id: -1 }).limit(1);
            console.log(projectOwner)
            // Get the loaner's loan amount
            console.log(" the loaner is "+loaner)
            let loanAmount = actions.remainingLoans[loaner];
            // Increase the loan amount by the specified value
            actions.remainingLoans[loaner] = loanAmount + value;
            console.log(" the amount  is "+loanAmount)
            actions.actionType = "add loan"
            let newAction = new ActionObject({
                actionNumber: actions.actionNumber + 1,
                actionType: actions.actionType,
                owner: actions.owner,
                loans: actions.loans,
                value: value,
                source: "-",
                taker: loaner,
                giver: "-",
                purpose: "-",
                remainingLoans: actions.remainingLoans,
                totalPaid: actions.totalPaid,
                totalRemaining:actions.totalRemaining+value,
                shlingFactor: actions.shlingFactor,
                date: date
            })


            // Save the updated actions object in the database
            await newAction.save();

            let loanActions = await loanAction.findOne({ project: projectOwner, loaner: loaner }).sort({ _id: -1 }).limit(1);
            //add to the loan action
            let newLoanAction = new loanAction({
                project: projectOwner,
                loaner: loaner,
                StartingLoan: loanActions.remaining||0,
                date: date,
                source: loanActions.source,
                paid: value * -1,
                total: loanActions.total,
                remaining: loanActions.remaining + value,
            })
            await newLoanAction.save()
            socket.emit("severResponse", "loan has been added")

        } else if (type === "new") {
            console.log("else")
            //add action
            let actions = await actionsobject.findOne({ owner: projectOwner }).sort({ _id: -1 }).limit(1);

            // Increase the loan amount by the specified value
            actions.remainingLoans[loaner] = value;
            actions.actionType = "add loan"
            let newAction = new ActionObject({
                actionNumber: actions.actionNumber + 1,
                actionType: actions.actionType,
                owner: actions.owner,
                loans: actions.loans,
                value: value,
                source: "-",
                taker: loaner,
                giver: "-",
                purpose: "-",
                remainingLoans: actions.remainingLoans,
                totalPaid: actions.totalPaid,
                totalRemaining:actions.totalRemaining+value,
                shlingFactor: actions.shlingFactor,
                date: date
            })
            await newAction.save();


            //add to the starting loan
            let newBaseLoan = new loans({
                project: projectOwner,
                loaner: loaner,
                StartingLoan: value,
                date: date,
            })
            await newBaseLoan.save()

            //add to the project base loan
            let baseProject = await ProjectObject.findOne({ project: projectOwner })
            console.log(baseProject)
            baseProject.loans[loaner] = value;
            console.log(baseProject)
            // Save the updated document in the database
            
            await ProjectObject.updateOne({ project: projectOwner }, { $set: { loans: baseProject.loans } });

            //add to the loan action
            let newLoanAction = new loanAction({
                project: projectOwner,
                loaner: loaner,
                StartingLoan: value,
                date: date,
                source: { abaa: 0, umi: 0, UAE: 0 },
                paid: 0,
                total: 0,
                remaining: value,
            })
            await newLoanAction.save()
            let loaners = await ProjectObject.find({ project: projectOwner })
            socket.emit("sendLoanersedit", { loaners })
            socket.emit("severResponse", "loan has been added")
        }
    })

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
    let loans = data.loans
    console.log(" loans are  " + loans)
    let totalproject = 0
    for (let loaner in loans) {
        totalproject += loans[loaner]
    }

    console.log("the total loan is " + totalproject)
    let project = data.project
    console.log("starting action")

    let newAction = new ActionObject({
        actionNumber: 1,
        actionType: "create",
        owner: project,
        loans: loans,
        value: 0,
        giver: "-",
        source: "-",
        taker: "-",
        purpose: "-",
        remainingLoans: loans,
        totalPaid: 0,
        totalRemaining: totalproject,
        shlingFactor: 0,
        date: date
    });
    let save = await newAction.save()
    console.log("action has started")
}

async function startLoan(data) {
    let date = data.date;
    let loanss = data.loans
    let project = data.project

    for (let loaner in loanss) {

        let newLoan = new loans({
            project: project,
            StartingLoan: loanss[loaner],
            loaner: `${loaner}`,
            date: date,
        })
        await newLoan.save()
        await StartLoanAction({ date, loaner: `${loaner}`, startLoan: loanss[loaner], project })
    }


}

async function StartLoanAction(data) {
    console.log("in function")
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
        StartingLoan: startingLoan,
        paid: 0,
        remaining: startingLoan,
        source: { abaa: abaa, umi: umi, UAE: UAE, total: 0 },

    })
    let save = await newLoanAction.save()
}

async function storeActionLoan(pay) {
    console.log("in saving")
    console.log(pay)
    await pay.calculateRemaining()
    let newLoanAction = new loanAction({
        project: pay.projectOwner,
        loaner: pay.loaner,
        date: pay.date,
        StartingLoan: pay.originalLoan,
        paid: pay.value,
        source: pay.sources,
        total: pay.total,
        remaining: pay.remaining
    })

    try {
        let save = await newLoanAction.save()
    }
    catch (error) {
        console.log(error)
    }
    return true
}
