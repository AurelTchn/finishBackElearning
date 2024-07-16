const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class SinscrireAmodule {
    constructor(id_module, id_apprenant, date_inscription = new Date(), montantpaye) {
        this.id_module = id_module
        this.id_apprenant = id_apprenant
        this.date_inscription = date_inscription
        this.montantpaye = montantpaye
    }

    async create() {
        const [rows] = await db.execute(
            "INSERT INTO `sinscrireAmodule`(`id_module`,`id_apprenant`,`date_inscription`,`montantpaye`) VALUES (?,?,?,?)",
            [this.id_module, this.id_apprenant, this.date_inscription, this.montantpaye]
        )
        return true
    }

    async verif_inscr_module() {
        try{
            const [rows] = await db.execute("SELECT * FROM sinscrireAmodule WHERE id_module=? AND id_apprenant=?",
                [this.id_module, this.id_apprenant]
            )
            if (rows.length > 0) {
                return true
            } else {
                return false
            }
        }catch(error){
            console.log(error)
        }
    }

}

module.exports = SinscrireAmodule