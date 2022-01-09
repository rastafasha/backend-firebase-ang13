import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

const serviceAccount = require("./serviceAccountKey.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://loginapp-7e55c.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
    mensaje: 'Hello from Firebase Functions!!!!'
  });
});
export const getGOTY = functions.https.onRequest( async (request, response) => {
  // const nombre = request.query.nombre || 'Sin Nombre';

  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map( doc => doc.data())

  response.json(juegos);
  // response.json(docsSnap.docs[0].data());
});


//Express

const app = express();
app.use(cors({origin: true}));

app.get('/goty', async (req, res)=>{
  // const nombre = request.query.nombre || 'Sin Nombre';

  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map( doc => doc.data())

  // response.json(docsSnap.docs[0].data());
  res.json(juegos);
  
});


app.post('/goty/:id', async (req, res)=>{

  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();

  if(!gameSnap.exists){
    res.status(404).json({
      ok: false,
      mensaje: 'No existe un juego con ese id ' + id
    });

  }else{
    const antes = gameSnap.data() || {votos: 0};
    await gameRef.update({
      votos: antes.votos + 1
    });
    res.json({
      ok: true, 
      mensaje: `Gracias por tu voto a ${antes.name}`
    });
  }
});


export const api = functions.https.onRequest(app);

