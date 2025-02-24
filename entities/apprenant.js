const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const path = require('path')

const dbcon = require('../db')
const db = dbcon.db

class Apprenant {
    constructor(nom, prenom, email, tel, sexe, password, photo, role, created_at = new Date(),updated_at=null){
        this.nom = nom
        this.prenom = prenom
        this.email = email
        this.tel = tel
        this.sexe = sexe
        this.password = password
        this.photo = photo
        this.role = role
        this.created_at = created_at
        this.updated_at = updated_at
        
        const __dirname = path.resolve();
        this.codeFilePath = path.join(__dirname, 'confirmation_codes.json')
        this.confirmationCodes = {}

    }

    async create() {
        let sql = 'SELECT * FROM `apprenant` WHERE email = ?'
        const [ rows ] = await db.execute(sql, [this.email])
        if ( rows.length > 0 ) {
            return false
        }else{
            const [ rows ] = await db.execute(
                "INSERT INTO `apprenant`(`nom`, `prenom`, `email`, `tel`,`sexe`,`password`,`photo`, `role`, `created_at`, `updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?)",
                [this.nom, this.prenom, this.email, this.tel, this.sexe,this.password,this.photo,this.role, this.created_at, this.updated_at]
            )
            this.id = rows.insertId
            return this.id
        }
        
    }

    async authentificate(){
        try{
            let sql = 'SELECT * FROM `apprenant` WHERE email = ?'
            const [ rows ] = await db.execute(sql, [this.email])
            if ( rows.length > 0 ) {
                const resultatPassword = await bcrypt.compare(this.password, rows[0].password)
                if(resultatPassword === true){
                    const data = {
                        id_apprenant: rows[0].id_apprenant,
                        nom: rows[0].nom,
                        prenom: rows[0].prenom,
                        email: rows[0].email,
                        tel: rows[0].tel,
                        sexe: rows[0].sexe,
                        photo: rows[0].photo,
                        role: JSON.parse(rows[0].role),
                        created_at: rows[0].created_at,
                        updated_at: rows[0].updated_at
                    }
                    console.log("login data : ", data)
                    const token = jwt.sign(data, process.env.TOKEN_FIRST_KEY)
                    return {accessToken: token, user: data, message: "Success"}
                }else{
                    return false
                }
            }
            return 1   
        }catch(erreur){
            throw erreur;
        }
        
    }

    async updateNomPrenom(email,newnom,newprenom,updated_at){
        try {
            const sql = "UPDATE `apprenant` SET `nom`=?, `prenom`=?, `updated_at`=? WHERE email=?"
            const [ rows ] = await db.execute(sql, [newnom, newprenom,updated_at, email])
            if ( rows) {
                return true
            } else {
                return false
            }
        }
        catch(error){
            return `Vous E-mail n'est pas encore inscrit${error}`
        }
    }

    async updatePassword(email,oldpassword,password,confirmpassword,updated_at){
        let sql = 'SELECT * FROM `apprenant` WHERE email = ?'
        let [row] = await db.execute(sql, [email])
        if(row.length > 0){
            const reponse = await bcrypt.compare(oldpassword,row[0].password)
            if(reponse == true){
                if(password == confirmpassword){
                    const salt = await bcrypt.genSalt(10)
                    const hashedPassword = await bcrypt.hash(password,salt)
                    let sql = 'UPDATE `apprenant` SET password = ?, updated_at=? WHERE email= ?'
                    await db.execute(sql, [hashedPassword,updated_at,email])
                    return true
                }
            }else{
                return false
            }
        }else{
            return 1
        }
    }

    async generateCodeConfirm(email){     
        const min = 100000;
        const max = 999999;
        const code = Math.floor(Math.random() * (max - min + 1)) + min;
        const mycode = code.toString()
        this.confirmationCodes[email] = mycode
        return mycode
    }

    async sendCodeMail(email){
        const code = await this.generateCodeConfirm(email)
        try{
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                secureConnection: false,
                port: 465,
                secure: true,
                auth: {
                    user: "aureltchanhouin@gmail.com",
                    pass: "oyfzpicdsyayixdw",
                },
            })

            const mailOptions = {
                from: "aureltchanhouin@gmail.com",
                to: `${email}`,
                subject: "Elearning Confirm email",
                html: `<p style="font-family: 'Times News Roman'">Voici le code pour confirmer votre email :<center>
                <h1 style="color:white;font-size:100px;font-weight:bold; style="font-family: 'Times News Roman'""><strong>${code}</strong></h1></center>
                <span  style="font-family: 'Times News Roman'">Veuillez copier ce code et saisir dans le formulaire pour valider 
                votre modification d'email.</span></p>`,
                replyTo: "aureltchanhouin@gmail.com",
                headers: {
                    "X-Mailer": "Node.js Nodemailer",
                    "X-Originating-IP": "127.0.0.1"
                }
            }
            transporter.sendMail(mailOptions, (error, info)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log("Email envoyé" + info.response)
                    fs.promises.writeFile(this.codeFilePath, JSON.stringify(this.confirmationCodes, null, 2))
                    return true
                }
            })
        }catch(er){
            return er 
        }
        
    }

    async changeEmail (email,code,newEmail,updated_at){
        const data = await fs.promises.readFile(this.codeFilePath, 'utf8');
        const confirmationCodes = JSON.parse(data);
        
        if(confirmationCodes[email]==code){
            let sql = 'SELECT * FROM `apprenant` WHERE email = ?'
            let [row] = await db.execute(sql, [email])
            if(row.length > 0){
                let sql = 'UPDATE `apprenant` SET email = ?,updated_at=? WHERE email = ?'
                await db.execute(sql,[newEmail,updated_at,email])
                return true
            }else{
                return "Error"
            }
        }else{
            return false
        }
    }

    async seeAllApprenant(){
        const allApprenant = []
        let sql = 'SELECT * FROM `apprenant` '
        let [rows] = await db.execute(sql)
        if(rows.length > 0){
            for(let row of rows){
                row.password = null
                allApprenant.push(row)
            }
            return allApprenant
        }else{
            return false
        }
    }

    async seeOneApprenant(email){
        let sql = 'SELECT * FROM `apprenant` WHERE email = ?'
        let [row] = await db.execute(sql, [email])
        if(row.length > 0){
            const resultat = {
                "nom": row[0].nom,
                "prenom": row[0].prenom,
                "email": row[0].email,
                "telephone": row[0].tel,
                "sexe": row[0].sexe,
                "photo": row[0].photo,
                "role": JSON.parse(row[0].role)
            }
            // for(const rol of resultat.role){
            //     console.log(rol)
            // }
            return resultat
        }else{
            return false
        }
    }

    async deleteOneApprenant(id){
        let sql = 'SELECT * FROM `apprenant` WHERE id_apprenant = ? '
        let [rows] = await db.execute(sql, [id])
        if(rows != ''){
            let sql = 'DELETE FROM apprenant WHERE id_apprenant = ? '
            await db.execute(sql, [id])
            return true
        }else{
            return false
        }
    }




}

module.exports = Apprenant