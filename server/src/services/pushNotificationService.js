import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:contact@mydjtv.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const notifyNewTrack = async (venueId, track) => {
  // Get all subscribed users for this venue
  // Send notification about new track playing
  const payload = {
    title: 'Nueva canción reproduciendo',
    body: `${track.title} - ${track.artist}`,
    icon: '/Mydjtv.jpg',
    badge: '/Mydjtv.jpg',
    data: { venueId, trackId: track.id }
  };
  
  // Implementation would fetch user subscriptions and send notifications
  console.log('Would send notification:', payload);
};

export const notifyCommercial = async (venueId, commercial) => {
  const payload = {
    title: 'Oferta especial disponible',
    body: commercial.title,
    icon: '/Mydjtv.jpg',
    data: { venueId, commercialId: commercial.id }
  };
  
  console.log('Would send commercial notification:', payload);
};