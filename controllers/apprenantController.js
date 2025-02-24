const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const Apprenant = require('../entities/apprenant')


exports.create = async (req, res, next) => {
    try {
        const token = req.body.token
        const decoded = jwt.verify(token, process.env.TOKEN_FIRST_KEY)
        
        if(decoded){
            const { nom, prenom, email, telephone, sexe, password, photo } = decoded;

            const apprenant = new Apprenant(nom, prenom, email, telephone, sexe, password, photo, null, new Date(), null)
            const apprenant_id = await apprenant.create()
            
            if ( apprenant_id ) {
                res.status(200).json({message: "Apprenant créé avec succès."})
            }else if(apprenant_id == false){
                res.status(200).json({message: "Cet email existe déjà"})
            }
        }else{
            res.status(500).json({message: "Vous n'êtes pas éligible sur cette page"})
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })    
    }
}

exports.sendConfirmMail = async (req, res) => {
    try {
        console.log("Oui")
        const nom = req.body.nom
        const prenom = req.body.prenom
        const email = req.body.email
        const telephone = req.body.telephone
        const sexe = req.body.sexe
        const plain_password = req.body.password
        const role = JSON.stringify(req.body.role)

        let photo = null
        if ( req.files ) {
            if ( "photo" in req.files && req.files["photo"][0].filename != null ) {
                photo = req.files["photo"][0].filename
            }
        }
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(plain_password, salt)
        const data = { nom, prenom, email, telephone, sexe, password, role, photo }
        const token = jwt.sign(data, process.env.TOKEN_FIRST_KEY)
        console.log("Token : ", token)


        const confirmUrl = `http://localhost:3000/successcreated?token=${token}`;

        const mailer = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use `true` for port 465, `false` for all other ports
            auth: {
                user: "aureltchanhouin@gmail.com",
                pass: "oyfzpicdsyayixdw",
            }
        });

        const mailOptions = {
            from: 'elearningAcademia@gmail.com', // sender address
            to: email, // list of receivers
            subject: "Eleaning Confirm Email", // Subject line
            html: `
                <p>Bonjour ${prenom},</p>
                <p>Merci de vous être inscrit sur notre plateforme. Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>
                <p><a href="${confirmUrl}">Confirmer votre email</a></p>
                <p>Si vous n'avez pas demandé cette inscription, veuillez ignorer cet email.</p>
                <p>Cordialement,<br>L'équipe E-learning</p>
            ` // html body
        };

        for (let attempt = 0; attempt < 15; attempt++) {
            try {
                let info = await mailer.sendMail(mailOptions);
                console.log("Success", info);
                res.status(200).json({token: token, message: "Succes"})
                return { success: true, info };
            } catch (error) {
                console.error("Mail failed to send:", error);
                if (attempt === 15 - 1) {
                    res.status(400).json({error: error, message:"Email non envoyé"})
                    return { success: false, error };
                }
                console.log(`Retrying... (${attempt + 1}/${15})`);
            }
        }

        //     const mailer = nodemailer.createTransport({
        //         // host: "smtp.ethereal.email",
        //         host: "smtp.gmail.com",
        //         port: 465, // port 587 ou 465
        //         secure: true, // Use `true` for port 465, `false` for all other ports
        //         auth: {
        //             /*user: "mazashisora@gmail.com",
        //             pass: "xqeejazodqdjgeje", oyfzpicdsyayixdw, noqmemuoznnljroq */
        //             user: "aureltchanhouin@gmail.com",
        //             pass: "oyfzpicdsyayixdw",
        //         }
        //     })
        // await mailer.sendMail({
        //     from: 'aureltchanhouin@gmail.com', // sender address
        //     to: email, // list of receivers
        //     subject: "Eleaning Confirm Email", // Subject line
        //     // text: "Hello world?", // plain text body
        //     html:`
        //         <p>Bonjour ${prenom},</p>
        //         <p>Merci de vous être inscrit sur notre plateforme. Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse email :</p>
        //         <p><a href="${confirmUrl}">Confirmer votre email</a></p>
        //         <p>Si vous n'avez pas demandé cette inscription, veuillez ignorer cet email.</p>
        //         <p>Cordialement,<br>L'équipe E-learning</p>
        //     `, // html body
        // }).then(( data ) => {
        //     console.log("Succes ", data)
        //     res.status(200).json({token: token, message: "Succes"})
        // })
        // .catch(( error ) => {
        //     console.error("mail failed to send : ", error)
        //     res.status(400).json({ error })
        // })
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de l'envoie d'email'" })    
    }
}

exports.login = async (req, res, next)=>{

    const email = req.body.email
    const password = req.body.password
    
    const apprenant = new Apprenant(null, null ,email,null,null, password, null,null)

    try {
        const data = await apprenant.authentificate()
        
        if ( data === false ) {
            res.status(200).json("Le mot de passe n'est pas correcte")
        } else if(data == 1) {
            res.status(200).json("Cet email n'est pas encore inscrit")
        }else{
            res.status(201).json(data) 
        }
    }catch(error){
        res.status(400).json({ error: error.message, message: "Quelque chose s'est mal passée" })
    }
}

exports.updateNomPrenom = async (req, res) => {
    const newnom = req.body.newnom
    const newprenom = req.body.newprenom
    const data = req.data
    const apprenant = new Apprenant(data.nom, data.prenom, data.email,data.tel,data.sexe, data.password,data.photo, data.role, new Date(), null)
    try {
        const response = await apprenant.updateNomPrenom(data.email,newnom,newprenom,new Date())
        if ( response === false ) {
            res.status(400).json("Echec de la modification")
        } else {
            res.status(200).json("Modifier avec succes")
        }
    } catch (error) {
        res.status(400).json("Un problème est survenu.")        
    }
}

exports.updatePassword = async (req,res) => {
    const oldpassword = req.body.oldpassword
    const password = req.body.password
    const cfpassword = req.body.cfpassword
    const data = req.data
    const apprenant = new Apprenant(data.nom, data.prenom, data.email,data.tel,data.sexe, data.password,data.photo, data.role, new Date(), null)

    const response = apprenant.updatePassword(data.email,oldpassword,password,cfpassword,new Date())
    if(response == true){
        res.status(200).json("Mot de passe modifié")
    }else if(response == false){
        res.status(400).json("Les mots de passes ne sont pas conformes")
    }else if(response == 1){
        res.status(400).json("Cet email n'est pas encore inscrit")
    }
}

exports.sendCodeMail = async (req,res) => {
    const data = req.data
    const apprenant = new Apprenant(data.nom, data.prenom, data.email,data.tel,data.sexe, data.password,data.photo, data.role, new Date(), null)

    const response = apprenant.sendCodeMail(data.email)
    if(response == true){
        res.status(200).json("Code envoyé avec succès")
    }else{
        res.status(400).josn(response)
    }
}

exports.modifyEmail = async (req, res) => {
    const data = req.data
    const code = req.body.code
    const newEmail = req.body.newEmail
    const apprenant = new Apprenant(data.nom, data.prenom, data.email,data.tel,data.sexe, data.password,data.photo, data.role, new Date(), null)

    const response = apprenant.changeEmail(data.email,code,newEmail,new Date())
    if(response == true){
        res.status(200).json("Mail modifié avec succès")
    }else if(response ==  false){
        res.status(400).json("Cet email n'es pas encore inscrit")
    }else{
        res.status(400).json("Le code de confirmation est incorrecte")
    }
}

exports.getAllApprenant = async (req, res) => {
    const data = req.data
    console.log(data)
    const apprenant = new Apprenant(data.nom, data.prenom, data.email, data.tel, data.sexe, data.password, data.photo, data.role, new Date(), null)
    
    const response = await apprenant.seeAllApprenant()
    if(response){
        res.status(201).json(response)
    }else{
        res.status(404).json("Aucun apprenant trouvé")
    }
        
}

exports.getOneApprenant = async (req, res) => {
    const data = req.data
    const apprenant = new Apprenant(data.nom, data.prenom, data.email,data.tel,data.sexe, data.password,data.photo, data.role, new Date(), null)    
    try {
        const response = await apprenant.seeOneApprenant(data.email)
        if(response){
            res.status(200).json(response)
        }else if(response==false){
            res.status(404).json("Id non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de l'affichage" })    
    }
}

exports.deleteApprenant = async (req, res) => {
    const data = req.data
    const apprenant = new Apprenant(data.nom, data.prenom, data.email,data.tel,data.sexe, data.password,data.photo, data.role, new Date(), null)    
    
    try {
        const response = await apprenant.deleteOneApprenant(req.data)
        if(response==true){
            res.status(201).json("Apprenant supprimé")
        }else{
            res.status(404).json("Apprenant non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la suppression" })    
    }
}