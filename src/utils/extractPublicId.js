// lib/extractPublicId.js
const extractPublicId = (imageUrl) => {
  if (!imageUrl) return "";

  const startIndex = imageUrl.indexOf("cruffin/");
  if (startIndex === -1) return "";

  const pathWithExtension = imageUrl.substring(startIndex); // örn: cruffin/1752589229987.webp
  const withoutExtension = pathWithExtension.replace(/\.[^/.]+$/, ""); // uzantıyı kaldır

  return withoutExtension; // örn: cruffin/1752589229987
};

export default extractPublicId;
