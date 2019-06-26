export default function() {
  const dialogs = document.getElementsByTagName("DIALOG");

  let isOpen = false;

  for (let i = 0; i < dialogs.length; i++) {
    isOpen = isOpen || dialogs[i].open;
  }

  return isOpen;
}
