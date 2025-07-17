import prisma from '../config/prisma.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: 'uploads/' });

export const uploadCommercial = [
  upload.single('audio'),
  async (req, res) => {
    try {
      const { title, duration } = req.body;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'mydjtv/commercials'
      });

      const commercial = await prisma.commercial.create({
        data: {
          title,
          venueId: req.user.venueId,
          audioUrl: result.secure_url,
          duration: parseInt(duration),
          thumbnail: result.secure_url.replace('.mp3', '.jpg')
        }
      });

      res.status(201).json({ success: true, commercial });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

export const getCommercials = async (req, res) => {
  try {
    const commercials = await prisma.commercial.findMany({
      where: { venueId: req.user.venueId }
    });
    
    res.json({ success: true, commercials });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCommercial = async (req, res) => {
  try {
    const commercial = await prisma.commercial.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json({ success: true, commercial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCommercial = async (req, res) => {
  try {
    await prisma.commercial.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ success: true, message: 'Commercial deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};