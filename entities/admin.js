const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const path = require("path")

const dbcon = require('../db')
const db = dbcon.db

class Admin {
    constructor(nom, prenom, email, password) {
        this.nom = nom
        this.prenom = prenom
        this.email = email
        this.password = password


        const __dirname = path.resolve();
        this.codeFilePath = path.join(__dirname, 'confirmation_codes_f.json')
        this.confirmationCodes = {}
    }

    async create() {
        let sql = 'SELECT * FROM `admin` WHERE email = ?'
        const [rows] = await db.execute(sql, [this.email])
        if (rows.length > 0) {
            return 3
        } else {
            const [rows] = await db.execute(
                "INSERT INTO `admin`(`nom`, `prenom`, `email`, `password`) VALUES (?,?,?,?)",
                [this.nom, this.prenom, this.email, this.password]
            )
            return true
        }
    }

    async authentificate() {
        try {
            let sql = 'SELECT * FROM `admin` WHERE email = ?'
            const [rows] = await db.execute(sql, [this.email])
            console.log(rows)
            if (rows.length > 0) {
                const resultatPassword = await bcrypt.compare(this.password, rows[0].password)
                if (resultatPassword === true) {
                    const data = {
                        id: rows[0].id,
                        nom: rows[0].nom,
                        prenom: rows[0].prenom,
                        email: rows[0].email
                    }
                    const token = jwt.sign(data, process.env.TOKEN_FIRST_KEY)
                    return { accessToken: token, user: data, message: "Success" }
                } else {
                    return false
                }
            } else {
                return 5
            }
        } catch (erreur) {
            throw erreur;
        }

    }

    async updateNomPrenom(email, newnom, newprenom, updated_at) {
        try {
            const sql = "UPDATE `formateur` SET `nom`=?, `prenom`=?, `updated_at`=? WHERE email=?"
            const [rows] = await db.execute(sql, [newnom, newprenom, updated_at, email])
            if (rows) {
                return true
            } else {
                return false
            }
        }
        catch (error) {
            return `Vous E-mail n'est pas encore inscrit${error}`
        }
    }

    async updatePassword(email, oldpassword, password, confirmpassword, updated_at) {
        let sql = 'SELECT * FROM `formateur` WHERE email = ?'
        let [row] = await db.execute(sql, [email])
        if (row.length > 0) {
            const reponse = await bcrypt.compare(oldpassword, row[0].password)
            if (reponse == true) {
                if (password == confirmpassword) {
                    const salt = await bcrypt.genSalt(10)
                    const hashedPassword = await bcrypt.hash(password, salt)
                    let sql = 'UPDATE `formateur` SET password = ?, updated_at=? WHERE email = ?'
                    await db.execute(sql, [hashedPassword, updated_at, email])
                    return true
                }
            } else {
                return false
            }
        } else {
            return 1
        }
    }

    async seeAllFormateur() {
        const allFormateur = []
        let sql = 'SELECT * FROM `formateur` '
        let [rows] = await db.execute(sql)
        if (rows.length > 0) {
            for (let row of rows) {
                row.password = null
                allFormateur.push(await this.seeOneFormateur(row.id_formateur))
            }
            return allFormateur
        } else {
            return false
        }
    }

    async seeOneAdmin(id) {
        let sql = 'SELECT * FROM `admin` WHERE id = ?'
        let [row] = await db.execute(sql, [id])
        if (row.length > 0) {
            const resultat = {
                "id": row[0].id,
                "nom": row[0].nom,
                "prenom": row[0].prenom,
                "email": row[0].email
            }
            // for(const rol of resultat.role){
            //     console.log(rol)
            // }
            return resultat
        } else {
            return false
        }
    }

    async deleteOneFormateur(id) {
        let sql = 'SELECT * FROM `formateur` WHERE id_formateur = ? '
        let [rows] = await db.execute(sql, [id])
        if (rows.length > 0) {
            let sql = 'DELETE FROM formateur WHERE id_formateur = ? '
            await db.execute(sql, [id])
            return true
        } else {
            return false
        }
    }

    async generateCodeConfirm(email) {
        const min = 100000;
        const max = 999999;
        const code = Math.floor(Math.random() * (max - min + 1)) + min;
        const mycode = code.toString()
        this.confirmationCodes[email] = mycode
        return mycode
    }

    async sendCodeMail(email) {
        const code = await this.generateCodeConfirm(email)
        try {
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
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log("Email envoyé" + info.response)
                    fs.promises.writeFile(this.codeFilePath, JSON.stringify(this.confirmationCodes, null, 2))
                    return true
                }
            })
        } catch (er) {
            return er
        }

    }

    async changeEmail(email, code, newEmail, updated_at) {
        const data = await fs.promises.readFile(this.codeFilePath, 'utf8');
        const confirmationCodes = JSON.parse(data);

        if (confirmationCodes[email] == code) {
            let sql = 'SELECT * FROM `formateur` WHERE email = ?'
            let [row] = await db.execute(sql, [email])
            if (row.length > 0) {
                let sql = 'UPDATE `formateur` SET email = ?, updated_at=? WHERE email = ?'
                await db.execute(sql, [newEmail, updated_at, email])
                return true
            } else {
                return "Error"
            }
        } else {
            return false
        }
    }

}

module.exports = Admin