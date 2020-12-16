const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64')
const base64Img = require('base64-img')

const {
  Media
} = require('../models')

// GET MEDIA
router.get('/', async (req, res) => {
  const media = await Media.findAll({
    attributes: ['id', 'image']
  }) //like select id, image from media

  // remap data to get full url image
  const mappedMedia = media.map((data) => {
    data.image = `${req.get('host')}/${data.image}`

    return data
  })

  return res.json({
    status: 'success',
    data: mappedMedia
  })
})

// POST MEDIA
router.post('/', (req, res) => {
  const image = req.body.image;

  // check if image is base64 using is-base64 lib
  if (!isBase64(image, {
      mimeRequired: true
    })) {
    return res.status(400).json({
      status: 'error',
      message: 'image must be base64'
    })
  }

  // Convert image base64 data to img and save to directory
  base64Img.img(image, './public/images', Date.now(), async (err, filepath) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      })
    }


    const filename = filepath.split('/').pop(); //get filename

    // insert into media database by model
    const media = await Media.create({
      image: `images/${filename}`
    })

    return res.json({
      status: 'success',
      data: {
        id: media.id,
        image: `${req.get('host')}/images/${filename}`
      }
    })
  })
})

module.exports = router;