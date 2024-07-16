const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class Recu {
    constructor(date_recu = new Date(), montant_recu, id_module, id_apprenant) {
        this.date_recu = date_recu
        this.montant_recu = montant_recu
        this.id_module = id_module
        this.id_apprenant = id_apprenant

    }

    generateNumRecu() {
        const min = 1000000000;
        const max = 9999999999;
        const code = Math.floor(Math.random() * (max - min + 1)) + min;
        const mycode = code.toString()
        return mycode
    }


    async create() {
        const num_recu = this.generateNumRecu()
        const [rows] = await db.execute(
            "INSERT INTO recu(date_recu, montant_recu, id_module, id_apprenant, num_recu) VALUES (?,?,?,?,?)",
            [this.date_recu, this.montant_recu, this.id_module, this.id_apprenant, num_recu]
        )
        return true
    }

    async getAllRecu(id_apprenant) {
        try {
            const result = []
            const rr = []
            const sql1 = "SELECT * FROM recu WHERE id_apprenant=?"
            const [row1] = await db.execute(sql1, [id_apprenant])
            console.log(row1)
            if (row1.length > 0) {
                for (let row of row1) {
                    result.push(await this.seeOneRecu(row.id_apprenant, row.id_recu))
                }
            }
            for(let r of result){
                rr.push(r[0])
            }
            return rr
        } catch (error) {
            console.log(error)
        }
    }

    async seeOneRecu(id_apprenant, id_recu) {
        let sql = 'SELECT * FROM `recu` WHERE id_apprenant = ? AND id_recu=?'
        let [row] = await db.execute(sql, [id_apprenant, id_recu])
        console.log("Regarde ici")

        const resu = []
        if (row.length > 0) {

            let sql1 = 'SELECT nom FROM `apprenant` WHERE id_apprenant = ?'
            let [row1] = await db.execute(sql1, [row[0].id_apprenant])

            let sql2 = 'SELECT prenom FROM `apprenant` WHERE id_apprenant = ?'
            let [row2] = await db.execute(sql2, [row[0].id_apprenant])

            let sql3 = 'SELECT email FROM `apprenant` WHERE id_apprenant = ?'
            let [row3] = await db.execute(sql3, [row[0].id_apprenant])

            let sql4 = 'SELECT libelle FROM `module` WHERE id_module = ?'
            let [row4] = await db.execute(sql4, [row[0].id_module])
            const resultat = {
                "nom": row1[0].nom,
                "prenom": row2[0].prenom,
                "email": row3[0].email,
                "date": row[0].date_recu,
                "num_recu": row[0].num_recu,
                "module": row4[0].libelle,
                "prix": row[0].montant_recu
            }
            // for(const rol of resultat.role){
            //     console.log(rol)
            // }
            resu.push(resultat)

            console.log(resu)
            return resu
        } else {
            return false
        }
    }

}
module.exports = Recu