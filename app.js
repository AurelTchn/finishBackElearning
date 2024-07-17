require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const routes = require('./routes')
const cors = require('cors')
const app = express()

app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* const Fedapay = require('fedapay')

Fedapay.apiKey = 'sk_sandbox_8PrtX-zqWSmhDBjYMde0Qhwj' */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', routes)


//Fedapay
/* app.post('/api/create-transaction', async (req, res) => {
    const { amount, description, customer } = req.body;
    console.log("OUI je suis là")
    console.log(amount)
    console.log(description)
    console.log(customer)
    try {
        const transaction = await Fedapay.Transaction.create({
            description: description,
            amount: amount,
            currency: 'XOF',
            customer: {
                firstname: customer.firstname,
                lastname: customer.lastname,
                email: customer.email
            }
        });

        res.json({ success: true, transaction });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.json({ success: false, message: error.message });
    }
});

app.post('/api/webhook', (req, res) => {
    const event = req.body;

    if (event.type === 'transaction.success') {
        const transaction = event.data;
        console.log('Transaction réussie:', transaction);
        // Traitez la transaction comme nécessaire (e.g., mise à jour de la base de données)
    }

    res.sendStatus(200);
}); */
/////////////////////////////////END FEDAPAY

const port = 8080
function listening(){
    console.log(`run on port : ${port} url : http://localhost:${port}`)
}
app.listen(port, listening)