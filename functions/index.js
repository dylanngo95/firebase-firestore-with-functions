const admin = require('firebase-admin');
const functions = require('firebase-functions');
const bodyParser = require('body-parser');
const express = require('express');

const firebaseAdmin = admin.initializeApp(functions.config().firebase);
const db = firebaseAdmin.firestore();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.status(200).send(JSON.stringify({
    id: 1,
    name: 'Tinh Ngo'
  }));
});

app.post('/content/add', (request, response) => {
  const id = request.body.id || 0;
  const name = request.body.name || 'Tester';

  db.collection('contents').doc(id).set({
    id: id,
    name: name,
  })
    .then(() => {
      response.status(200).send(JSON.stringify({
        status: 200,
        data: {
        },
        message: 'add success'
      }));
    })
    .catch((err) => {
      response.status(500).send(JSON.stringify({
        status: 500,
        data: {},
        message: "error: " + err
      }));
    });

});

exports.createContent = functions.firestore
  .document('contents/{contentId}')
  .onCreate((snap, context) => {
    // const newValue = snap.data();
    // const id = newValue.id;
    // let name = newValue.name;

    // add count
    db.collection('counts').doc('1').get()
      .then((doc) => {
        if (doc.exists) {
          db.collection('counts').doc('1').set({
            id: '1',
            contentCount: doc.data().contentCount + 1,
          });
        } else {
          db.collection('counts').doc('1').set({
            id: '1',
            contentCount: 1,
          });
        }
      })
      .catch((err) => {
        console.log('dont add');
      });

    // name = addPizza(name);
    // return snap.ref.update({ name: name });

  });

exports.deleteContent = functions.firestore
  .document('contents/{contentId}')
  .onDelete((snap, content) => {
    
    // delete content
    db.collection('counts').doc('1').get()
      .then((doc) => {
        if (doc.exists) {
          db.collection('counts').doc('1').set({
            id: '1',
            contentCount: doc.data().contentCount -1,
          });
        } else {
          db.collection('counts').doc('1').set({
            id: '1',
            contentCount: 0,
          });
        }
      })
      .catch((err) => {
        console.log('dont add');
      });

  });

exports.updateContent = functions.firestore
  .document('contents/{contentId}')
  .onUpdate((change, content) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.name === after.name) {
      console.log('text dont change');
      return null;
    }

    const name = addPizza(after.name);

    return change.after.ref.set({
      name: name
    },
      {
        merge: true
      });

  });

function addPizza(text) {
  return text.replace('pizza', '🍕');
}

exports.api = functions.https.onRequest(app);
