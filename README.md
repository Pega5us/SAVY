# SAVY: A web app to play local videos in sync

## Access application [here!](https://savy-player.herokuapp.com/)

## SAVY Player provides service to watch local video in a synchronised way.

---

### Convert .mkv to .mp4

```bash
sudo apt  install ffmpeg

ffmpeg -i input.mkv -c copy output.mp4

```

### Convert .srt to .vtt [here](https://www.happyscribe.com/subtitle-tools/convert-srt-to-vtt)

---
### Server side dependencies

```
 Socket.io

 Node.js

 Express
```

---

## How to run locally


#### How to run the server

```bash
git clone https://github.com/abhay-666/SAVY.git

cd SAVY

```

#### Install Dependencies

```bash
 npm install
```

#### Run the server

```bash
 npm run dev
```

Server will be running on your PORT environment variable || PORT 5000

---