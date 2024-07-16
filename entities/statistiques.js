const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const dbcon = require('../db')
const db = dbcon.db

class Statistiques {

    async nombre_apprenant_modules(id_formateur) {
        try {
            const sql1 = "SELECT id_module FROM `module` WHERE id_formateur=?"
            const [row1] = await db.execute(sql1, [id_formateur])
            let nb = 0
            for (let row of row1) {
                const sql2 = "SELECT COUNT(*) AS nbb FROM `sinscrireAmodule` WHERE id_module=?"
                const [row2] = await db.execute(sql2, [row.id_module])
                nb += row2[0].nbb
            }
            return nb
        } catch (error) {
            console.log(error)
        }

    }

    async nombre_module_formateur(id_formateur) {
        try {
            const sql1 = "SELECT COUNT(*) AS nb FROM `module` WHERE id_formateur = ?"
            const [row1] = await db.execute(sql1, [id_formateur])
            return row1[0].nb

        } catch (error) {
            console.log(error)
        }
    }

    async nombre_commentaire(id_formateur) {
        try {
            const sql3 = "SELECT id_module FROM `module` WHERE id_formateur=?"
            const [row3] = await db.execute(sql3, [id_formateur])
            console.log(row3)
            let nb = 0
            for (let row of row3) {
                const sql4 = "SELECT COUNT(*) AS nbb FROM `commentaire` WHERE id_module=?"
                const [row4] = await db.execute(sql4, [row.id_module])
                nb += row4[0].nbb
            }
            console.log("Voici " + nb)
            return nb
        } catch (error) {
            console.log(error)
        }
    }

    async nombre_apprenant_par_module(id_formateur) {
        try {
            let sql5 = "SELECT id_module FROM `module` WHERE id_formateur=?"
            let [row5] = await db.execute(sql5, [id_formateur])

            const resultat = []
            for (let row of row5) {
                let sql6 = "SELECT COUNT(*) AS nb FROM `sinscrireAmodule` WHERE id_module=?"
                let [row6] = await db.execute(sql6, [row.id_module])

                let sql7 = "SELECT * FROM module WHERE id_module = ?"
                let [row7] = await db.execute(sql7, [row.id_module])

                let result = {
                    image: row7[0].photo,
                    name: row7[0].libelle,
                    cost: row7[0].tarif,
                    apprenant: row6[0].nb
                }
                resultat.push(result)
            }
            return resultat
        } catch (error) {
            console.log(error)
        }
    }

    async courbe_apprenant() {
        try {

            const sql8 = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total_apprenant FROM apprenant GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY DATE_FORMAT(created_at, '%Y-%m')";
            const [row8] = await db.execute(sql8);

            const sql9 = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total_formateur FROM formateur GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY DATE_FORMAT(created_at, '%Y-%m')";
            const [row9] = await db.execute(sql9);

            const data = [];

            const apprenantMap = new Map();
            row8.forEach(row => {
                apprenantMap.set(row.month, row.total_apprenant);
            });

            const formateurMap = new Map();
            row9.forEach(row => {
                formateurMap.set(row.month, row.total_formateur);
            });

            // Fusionner les deux maps en un tableau de données
            apprenantMap.forEach((total_apprenant, month) => {
                const total_formateur = formateurMap.get(month) || 0;
                data.push({ name: month, users: total_apprenant, teachers: total_formateur });
            });

            // Ajouter les mois présents uniquement dans formateurMap
            formateurMap.forEach((total_formateur, month) => {
                if (!apprenantMap.has(month)) {
                    data.push({ name: month, users: 0, teachers: total_formateur });
                }
            });

            // Trier les données par mois
            data.sort((a, b) => new Date(a.name) - new Date(b.name));

            console.log(data);

            return data
        } catch (error) {
            console.log(error)
        }
    }

    async courbe_formateur() {
        try {


            return true
        } catch (error) {
            console.log(error)
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

            const sql1 = "UPDATE `module` SET `libelle`=?, `id_formateur`=?, `points`=?, `tarif`=?, `photo`=?, `updated_at`=? WHERE id_module=?"
            const [rows1] = await db.execute(sql1, [libelle, id_formateur, points, tarif, photo, new Date(), id_module])
            return true
        }
        catch (error) {
            return `${error}`
        }
    }

    async rechercher(namemodule, namecourse) {
        try {
            if (namecourse) {
                const allModule = []
                const sql0 = "SELECT id_cours FROM cours WHERE libelle=?"
                const [row0] = await db.execute(sql0, [namecourse])
                console.log("Kejfjejkef")
                console.log(namecourse)
                console.log(row0)
                if (row0.length > 0 && row0[0].id_cours) {
                    const sql1 = "SELECT * FROM `formateur` WHERE id_cours=?"
                    const [rows1] = await db.execute(sql1, [row0[0].id_cours])

                    console.log(rows1)
                    for (let row of rows1) {
                        const sql2 = "SELECT * FROM `module` WHERE id_formateur=?"
                        const [rows2] = await db.execute(sql2, [row.id_formateur])

                        if (rows2) {
                            for (let roww of rows2) {
                                allModule.push(await this.seeOneModule(roww.id_module))
                            }
                        }

                    }
                    return allModule
                }

                const sql4 = "SELECT * FROM module WHERE libelle=?"
                const [rows6] = await db.execute(sql4, [namemodule])
                for (let r of rows6) {
                    allModule.push(await this.seeOneModule(r.id_module))
                }
                return allModule

            }
            if (namemodule) {
                const allModule = []
                
            }
        } catch (error) {
            console.log(error)
        }
    }

    async seeOneModule(id_module) {
        try {
            const sql1 = "SELECT * FROM module WHERE id_module=?"
            const [row1] = await db.execute(sql1, [id_module])
            console.log(row1)

            const sql2 = "SELECT id_formateur FROM module WHERE id_module=?"
            const [row2] = await db.execute(sql2, [id_module])

            const sql3 = "SELECT * FROM formateur WHERE id_formateur=?"
            const [row3] = await db.execute(sql3, [row2[0].id_formateur])

            const result = {
                "id": row1[0].id_module,
                "title": row1[0].libelle,
                "professor": `Prof ${row3[0].nom} ${row3[0].prenom}`,
                "photoURL": row1[0].photo,
                "professorPhoto": row3[0].photo,
                "rating": 4.8,
                "price": row1[0].tarif
            }
            return result
        } catch (error) {
            console.log(error)
        }

        
    }
    async compter(namemodule, namecourse){
        try{
            if (namecourse) {
                const allModule = []
                const sql0 = "SELECT id_cours FROM cours WHERE libelle=?"
                const [row0] = await db.execute(sql0, [namecourse])
                console.log("Kejfjejkef")
                console.log(namecourse)
                console.log(row0)
                if (row0.length > 0 && row0[0].id_cours) {
                    const sql1 = "SELECT * FROM `formateur` WHERE id_cours=?"
                    const [rows1] = await db.execute(sql1, [row0[0].id_cours])

                    console.log(rows1)
                    for (let row of rows1) {
                        const sql2 = "SELECT * FROM `module` WHERE id_formateur=?"
                        const [rows2] = await db.execute(sql2, [row.id_formateur])

                        if (rows2) {
                            for (let roww of rows2) {
                                allModule.push(await this.seeOneModule(roww.id_module))
                            }
                        }

                    }
                    var i = 0
                    for(let j of allModule){
                        i = i + 1
                    }
                    return i
                }

                const sql4 = "SELECT * FROM module WHERE libelle=?"
                const [rows6] = await db.execute(sql4, [namemodule])
                for (let r of rows6) {
                    allModule.push(await this.seeOneModule(r.id_module))
                }
                var i = 0
                    for(let j of allModule){
                        i = i + 1
                    }
                return i

            }
        }catch(error){
            console.log(error)
        }
    }
}

module.exports = Statistiques