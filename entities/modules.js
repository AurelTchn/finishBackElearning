const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class Modules {
    constructor(libelle, created_at = new Date(), updated_at = null, id_formateur, points, tarif, photo) {
        this.libelle = libelle
        this.id_formateur = id_formateur
        this.created_at = created_at
        this.updated_at = updated_at
        this.points = points
        this.tarif = tarif
        this.photo = photo
    }

    async create() {
        let sql = 'SELECT libelle FROM `module` WHERE id_formateur = ? '
        let [rows] = await db.execute(sql, [this.id_formateur])
        for (let module_ of rows) {
            if (module_.libelle == this.libelle) {
                return 3
            }
        }
        try {
            const [rows] = await db.execute(
                "INSERT INTO `module`(`libelle`,`created_at`,`updated_at`,`id_formateur`, `points`, `tarif`, `photo`) VALUES (?,?,?,?,?,?,?)",
                [this.libelle, new Date(), null, this.id_formateur, this.points, this.tarif, this.photo]
            )
            return true
        } catch (error) {
            return error
        }

    }

    /* async seeOneModule(id_module) {
        let sql = 'SELECT libelle FROM `module` WHERE id_module = ?'
        let [row] = await db.execute(sql, [id_module])
        if (row.length > 0) {
            const nom_module = row[0].libelle
            return nom_module
        } else {
            return false
        }
    } */

    async seeAllModulesOnFormateur(id_formateur) {
        const allModules = []
        let sql = 'SELECT module.id_module, module.tarif, module.libelle, module.points, module.photo FROM `module`, `formateur` WHERE formateur.id_formateur=? AND formateur.id_formateur=module.id_formateur '
        let [rows] = await db.execute(sql, [id_formateur])
        if (rows.length > 0) {
            for (let row of rows) {
                allModules.push(row)
            }
            return allModules
        } else {
            return false
        }
    }


    async deleteOneModules(id_module) {
        let sql = 'SELECT * FROM `module` WHERE id_module = ? '
        let [rows] = await db.execute(sql, [id_module])
        if (rows.length > 0) {
            let sql = 'DELETE FROM module WHERE id_module = ? '
            await db.execute(sql, [id_module])
            return true
        } else {
            return false
        }
    }

    async updatemodule(id_module, id_formateur, libelle, points, tarif, photo) {
        try {
            if (photo) {
                const sql1 = "UPDATE `module` SET `libelle`=?, `id_formateur`=?, `points`=?, `tarif`=?, `photo`=?, `updated_at`=? WHERE id_module=?"
                const [rows1] = await db.execute(sql1, [libelle, id_formateur, points, tarif, photo, new Date(), id_module])
                return true
            }else{
                const sql1 = "UPDATE `module` SET `libelle`=?, `id_formateur`=?, `points`=?, `tarif`=?, `updated_at`=? WHERE id_module=?"
                const [rows1] = await db.execute(sql1, [libelle, id_formateur, points, tarif, new Date(), id_module])
                return true
            }

        }
        catch (error) {
            return `${error}`
        }
    }

    async affichertoutout() {
        try {
            const re = []
            const sql1 = "SELECT * FROM module"
            const [row1] = await db.execute(sql1)
            for (let r of row1) {
                re.push(await this.oneModule(r.id_module))
            }
            return re
        } catch (error) {
            console.log(error)
        }
    }

    async oneModule(id_module) {
        try {
            const sql1 = "SELECT * FROM module WHERE id_module=?"
            const [row1] = await db.execute(sql1, [id_module])

            const result = {
                "created_at": row1[0].created_at,
                "id_formateur": row1[0].id_formateur,
                "id_module": row1[0].id_module,
                "libelle": row1[0].libelle,
                "photo": row1[0].photo,
                "points": row1[0].points,
                "tarif": row1[0].tarif,
                "updated_at": row1[0].updated_at
            }

            return result
        } catch (error) {
            console.log(error)
        }
    }

    async vewmodule(id_module) {
        try {
            const sql1 = "SELECT * FROM module WHERE id_module=?"
            const [row1] = await db.execute(sql1, [id_module])

            const sql2 = "SELECT id_formateur FROM module WHERE id_module=?"
            const [row2] = await db.execute(sql2, [id_module])

            const sql3 = "SELECT nom, prenom, photo FROM formateur WHERE id_formateur=?"
            const [row3] = await db.execute(sql3, [row2[0].id_formateur])

            const resul = {
                "libellemodule": row1[0].libelle,
                "points": row1[0].points,
                "rating": row1[0].rating,
                "photomodule": row1[0].photo,
                "tarif": row1[0].tarif,
                "photoprof": row3[0].photo,
                "nom": row3[0].nom,
                "prenom": row3[0].prenom

            }
            return resul
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Modules