var events = { mute: 0, unmute: 0, ended: 0 },
  r,
  track,
  stream,
  blobs = [],
  video = document.createElement('video');

navigator.mediaDevices
  .getDisplayMedia({ video: { frameRate: 60 } })
  .then(async (_) => {
    return new Promise(async (resolve) => {
      stream = _;
      const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.addTrack(audio.getAudioTracks()[0]);
      stream.onactive = stream.oninactive = (e) => console.log(e);
      [track] = stream.getVideoTracks();
      track.onmute = track.onunmute = track.onended = (e) => ++events[e.type];
      r = new MediaRecorder(stream, { audioBitrateMode: 'cbr' });
      video.autoplay = true;
      video.ontimeupdate = (e) => {
        if (e.target.currentTime >= 60 * 5) {
          r.stop();
          track.stop();
          audio.getAudioTracks()[0].stop();
          video.srcObject = null;
          console.log(video.currentTime);
        }
      };
      video.srcObject = r.stream;

      r.onstop = (e) => {
        console.log(e);
        resolve();
      };
      r.ondataavailable = (e) => e.data.size && blobs.push(e.data);
      r.start(100);
    });
  })
  .then((_) => {
    console.log(
      URL.createObjectURL(new Blob(blobs, { type: 'video/webm' })),
      events
    );
  });
