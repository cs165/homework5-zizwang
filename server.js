const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1yraWOiU7Sf7VTfxAE8DoZZWXUH82Tc7IIvzWwn0-oFo';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

function indexOf(row, str) {
    for (let i = 0; i < row.length; i++) {
        if (row[i].toLowerCase() === str.toLowerCase())
            return i;
    }
    return -1;
}

async function onGet(req, res) {
    const result = await sheet.getRows();
    const rows = result.rows;
    console.log(rows);

    // TODO(you): Finish onGet.
    let items = [];

    for (let i = 1; i < rows.length; i++) {
        let item = {};
        for (let j = 0; j < rows[0].length; j++)
            item[rows[0][j]] = rows[i][j];
        items.push(item);
    }

    res.json(items);
}
app.get('/api', onGet);

async function onPost(req, res) {
    const messageBody = req.body;

    // TODO(you): Implement onPost.
    const result = await sheet.getRows();
    const rows = result.rows;
    const newRow = [];

    for (let i = 0; i < rows[0].length; i++)
        newRow.push('');
    for (let key in messageBody)
        newRow[indexOf(rows[0], key)] = messageBody[key];

    await sheet.appendRow(newRow);

    res.json( { response: 'success'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
    const column  = req.params.column;
    const value  = req.params.value;
    const messageBody = req.body;

     // TODO(you): Implement onPatch.
    const result = await sheet.getRows();
    const rows = result.rows;
    const colInd = indexOf(rows[0], column);
    let rowInd = -1;

    if (colInd > -1) {
        for (let i = 1; i < rows.length; i ++)
            if (rows[i][colInd].toLowerCase() === value.toLowerCase()) {
                rowInd = i;
                break;
            }
    }

    if (rowInd > -1) {
        const newRow = rows[rowInd];
        for (let key in messageBody)
            newRow[rows[0].indexOf(key)] = messageBody[key];
        await sheet.setRow(rowInd, newRow);
    }

    res.json( { response: 'success'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
    const column  = req.params.column;
    const value  = req.params.value;

    // TODO(you): Implement onDelete.
    const result = await sheet.getRows();
    const rows = result.rows;
    const colInd = indexOf(rows[0], column);
    let rowInd = -1;

    if (colInd > -1) {
        for (let i = 1; i < rows.length; i++)
            if (rows[i][colInd].toLowerCase() === value.toLowerCase()) {
                rowInd = i;
                break;
            }
    }

    if (rowInd > -1)
        await sheet.deleteRow(rowInd);

    res.json( { response: 'success'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`);
});
