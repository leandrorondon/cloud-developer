require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { requireAuth } from './auth';

var validUrl = require('valid-url');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Filtered Image Endpoint
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get( "/filteredimage",
    requireAuth,
    async ( req, res ) => {
      let { image_url } = req.query;

      if ( !image_url ) {
        return res.status(400).send(`image_url is required`);
      }
      if (!validUrl.isUri(image_url)) {
        return res.status(400).send(`image_url is invalid`);
      }
      filterImageFromURL(image_url)
        .then((filteredPath) => {
          res.sendFile(filteredPath, function (err) {
            if (err) {
              console.log(err)
              res.status(500).send('internal error')
            } else {
              deleteLocalFiles([filteredPath]);
            }
          })
      })
      .catch((err) => {
        console.error(err.message)
        if (err.message.includes('Unsupported MIME type:')) {
          res.status(422).send(err.message)
        } else if (err.message.includes('Could not find MIME')) {
          res.status(422).send("Unprocessable entity")
        } else {
          res.status(500).send('internal error')
        }
      })
    }
  );

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();