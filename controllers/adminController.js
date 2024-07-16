const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const dbcon = require('../db')
const db = dbcon.db

const Admin = require('../entities/admin')

exports.decodeToken = async (req, res) => {
    try {
        const token = req.body.token
        const decoded = jwt.verify(token, process.env.TOKEN_FIRST_KEY)

        if (decoded) {
            res.status(201).json(decoded)
        }else{
            res.status(200).json("Token non décoder")
        }
    }catch(error){
        res.status(400).json(error)
    }
    
}

exports.create = async (req, res) => {

    try {
        const nom = req.body.nom
        const prenom = req.body.prenom
        const email = req.body.email
        const plain_password = req.body.password


        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(plain_password, salt)
        const admin = new Admin(nom, prenom, email, password)
        const admin_id = await admin.create()
        if (admin_id == true) {
            res.status(201).json("Formateur créé avec succès.")
        } else if (admin_id == 3) {
            res.status(200).json("Cet email existe déjà")
        } else {
            res.status(400).json("Erreur " + admin_id)
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la création de compte" })
    }
}

exports.sendConfirmMail = async (req, res) => {
    try {
        const nom = req.body.nom
        const prenom = req.body.prenom
        const email = req.body.email
        const tel = req.body.tel
        const sexe = req.body.sexe
        const plain_password = req.body.password
        const role = JSON.stringify(req.body.role)
        const description = req.body.description
        const id_cours = req.body.id_cours

        let photo = null
        if (req.files) {
            if ("photo" in req.files && req.files["photo"][0].filename != null) {
                photo = req.files["photo"][0].filename
            }
        }
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(plain_password, salt)
        const data = { nom, prenom, email, tel, sexe, password, role, description, photo, id_cours }
        const token = jwt.sign(data, process.env.TOKEN_FIRST_KEY)
        console.log("Token : ", token)

        const mailer = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "aureltchanhouin@gmail.com",
                pass: "oyfzpicdsyayixdw",
            },
        })

        mailer.sendMail({
            from: '"Aurel TCHN" <aureltchanhouin@gmail.com>',
            to: email,
            subject: "Confirm mail",
            // text: "Hello world?", // plain text body
            html: token,
        }).then((data) => {
            console.log("mail send successfuly : ", data)
            res.status(200).json("Success")
        })
            .catch((error) => {
                console.error("mail failed to send : ", error)
                res.status(400).json({ error })
            })

    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de l'envoie d'email'" })
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    const admin = new Admin(null, null, email, password)
    const data = await admin.authentificate()
    try {
        if (data === false) {
            res.status(200).json("Vérifier")
        } else if (data == 5) {
            res.status(200).json("Vous n'êtes pas un membre d'administration")
        } else {
            res.status(201).json(data)
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Quelque chose s'est mal passée" })
    }
}

exports.updateNomPrenom = async (req, res) => {
    const newnom = req.body.newnom
    const newprenom = req.body.prenom
    const data = req.data
    const formateur = new Formateur(data.nom, data.prenom, data.email, data.tel, data.sexe, data.password, data.photo, data.role, data.description, data.created_at, new Date(), data.id_cours)
    try {
        const response = await formateur.updateNomPrenom(data.email, newnom, newprenom, new Date())
        if (response === false) {
            res.status(400).json("Echec de la modification")
        } else {
            res.status(200).json("Modifier avec succes")
        }
    } catch (error) {
        res.status(400).json("Un problème est survenu.")
    }
}

exports.updatePassword = async (req, res) => {
    const oldpassword = req.body.oldpassword
    const password = req.body.password
    const cfpassword = req.body.cfpassword
    const data = req.data
    const formateur = new Formateur(data.nom, data.prenom, data.email, data.tel, data.sexe, data.password, data.photo, data.role, data.description, data.created_at, new Date(), data.id_cours)

    const response = formateur.updatePassword(data.email, oldpassword, password, cfpassword, new Date())
    if (response == true) {
        res.status(200).json("Mot de passe modifié")
    } else if (response == false) {
        res.status(400).json("Les mots de passes ne sont pas conformes")
    } else if (response == 1) {
        res.status(400).json("Cet email n'est pas encore inscrit")
    }
}

exports.sendCodeMail = async (req, res) => {
    const data = req.data
    const formateur = new Formateur(data.nom, data.prenom, data.email, data.tel, data.sexe, data.password, data.photo, data.role, data.description, new Date(), null, data.id_cours)

    const response = formateur.sendCodeMail(data.email)
    if (response == true) {
        res.status(200).json("Code envoyé avec succès")
    } else {
        res.status(400).josn(response)
    }
}

exports.modifyEmail = async (req, res) => {
    const data = req.data
    const code = req.body.code
    const newEmail = req.body.newEmail
    const formateur = new Formateur(data.nom, data.prenom, data.email, data.tel, data.sexe, data.password, data.photo, data.role, data.description, data.created_at, new Date(), data.id_cours)

    const response = formateur.changeEmail(data.email, code, newEmail, new Date())
    if (response == true) {
        res.status(200).json("Mail modifié avec succès")
    } else if (response == false) {
        res.status(400).json("Cet email n'es pas encore inscrit")
    } else {
        res.status(400).json("Le code de confirmation est incorrecte")
    }
}

exports.getAllFormateur = async (req, res) => {
    const formateur = new Formateur(null, null, null, null, null, null, null, null, null, new Date(), null, null)

    const response = await formateur.seeAllFormateur()
    if (response) {
        res.status(201).json(response)
    } else {
        res.status(404).json("Aucun apprenant trouvé")
    }
}

exports.getOneAdmin = async (req, res) => {
    const data = req.data

    const admin = new Admin(null, null, null, null)
    try {
        const response = await admin.seeOneAdmin(data.id)
        
        if (response) {
            res.status(200).json(response)
        } else if (response == false) {
            res.status(404).json("Id non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de l'affichage" })
    }
}

exports.deleteFormateur = async (req, res) => {
    const data = req.data
    const formateur = new Formateur(data.nom, data.prenom, data.email, data.tel, data.sexe, data.password, data.photo, data.role, data.description, new Date(), null, data.id_cours)

    try {
        const response = await formateur.deleteOneApprenant(req.data)
        if (response == true) {
            res.status(201).json("Formateur supprimé")
        } else {
            res.status(404).json("Formateur non trouvé")
        }
    } catch (error) {
        res.status(400).json({ error: error.message, message: "Une erreur est survenue lors de la suppression" })
    }
}