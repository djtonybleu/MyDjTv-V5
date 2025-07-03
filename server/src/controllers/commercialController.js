import Commercial from '../models/Commercial.js';
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

      const commercial = await Commercial.create({
        title,
        venue: req.user.venue._id,
        audioUrl: result.secure_url,
        duration: parseInt(duration),
        thumbnail: result.secure_url.replace('.mp3', '.jpg')
      });

      res.status(201).json({ success: true, commercial });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

export const getCommercials = async (req, res) => {
  try {
    const commercials = await Commercial.find({ venue: req.user.venue._id });
    res.json({ success: true, commercials });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCommercial = async (req, res) => {
  try {
    const commercial = await Commercial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!commercial) {
      return res.status(404).json({ message: 'Commercial not found' });
    }

    res.json({ success: true, commercial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCommercial = async (req, res) => {
  try {
    const commercial = await Commercial.findByIdAndDelete(req.params.id);
    
    if (!commercial) {
      return res.status(404).json({ message: 'Commercial not found' });
    }

    res.json({ success: true, message: 'Commercial deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};