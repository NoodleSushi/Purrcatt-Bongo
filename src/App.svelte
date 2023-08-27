<script lang="ts">
  import ImageSequence from "./lib/ImageSequence.svelte";
  import * as Tone from "tone";
  import { makeNoise2D } from "fast-simplex-noise";
  import Spamtector from "./lib/Spamtector";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import spaceBgUrl from "./assets/space-bg.png";

  const makeNoise = makeNoise2D();
  const spamtector = new Spamtector();
  const isSpammingStore = spamtector.isSpamming$;
  const insOpacity = tweened(0, {duration: 400, easing: cubicOut});

  const bongoHiPlayer = new Tone.Player("audio/bongo-hi.wav").toDestination();
  const bongoLowPlayer = new Tone.Player("audio/bongo-low.wav").toDestination();
  const bongoTripPayer = new Tone.Player({
    url: "audio/bongotrip.mp3", 
    loop: true, 
    fadeIn: 5, 
    fadeOut: 0.5}
  ).toDestination();

  let startTime: DOMHighResTimeStamp;
  let lastTime: DOMHighResTimeStamp;
  let elapsed: number = 0;
  const speed: number = 0.008;

  function lerp(a: number, b: number, alpha: number) {
    return a + alpha * (b - a);
  }

  requestAnimationFrame(update);
  function update(time: DOMHighResTimeStamp) {
    requestAnimationFrame(update);
    if (!startTime)
      startTime = time;
    if (!lastTime)
      lastTime = time;
    const dt = time - lastTime;
    elapsed += dt;
    spamtector.update();

    if (spamtector.isSpamming) {
      epicness = Math.min(epicness + dt * 0.0001, 1);
    } else {
      epicness = lerp(epicness, 0, Math.pow(0.5, dt * 0.18));
    }
    lastTime = time;
  }

  let catFrameIdx = 0;
  let epicness = 0;
  $: catScale = epicness * 0.5 + 1;
  $: catX = epicness * 50 * makeNoise(elapsed * speed, 0);
  $: catY = epicness * 50 * makeNoise(elapsed * speed, 100);

  isSpammingStore.subscribe((isSpamming) => {
    if (isSpamming)
      bongoTripPayer.start();
    else
      bongoTripPayer.stop();
  })

  const keyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    if (e.repeat)
      return;
    switch (e.key) {
      case "z":
        bongoLowPlayer.start();
        spamtector.press();
        catFrameIdx |= 0b10;
        break;
      case "x":
        bongoHiPlayer.start();
        spamtector.press();
        catFrameIdx |= 0b01;
        break;
    }
  };

  const keyUp = (e: KeyboardEvent) => {
    e.preventDefault();
    if (e.repeat)
      return;
    switch (e.key) {
      case "z":
        catFrameIdx &= ~0b10;
        break;
      case "x":
        catFrameIdx &= ~0b01;
        break;
    }
  }

  onMount(() => {
    insOpacity.set(1);
    setTimeout(() => {
      insOpacity.set(0);
    }, 4000);
  });
</script>

<svelte:window on:keydown={keyDown} on:keyup={keyUp}/>

<div class="layer"
  style:background-image={`url(${spaceBgUrl})`} 
  style:opacity={Math.min(epicness * 3, 1)} 
  style:background-position={`${elapsed}px ${elapsed}px`}
/>
<div class="layer" style:opacity={$insOpacity}>
  <center><img src="img/instructions.png" alt="instructions"></center>
</div>
<div class="content">
  <div
    style:transform={`translate(${catX}px, ${catY}px) scale(${catScale}, ${catScale})`}
  >
    <ImageSequence width="500px" dir="img/cat-bongo" idx={catFrameIdx}/>
  </div>
</div>

<style>
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
  }

  .layer {
    position: fixed;
    height: 100vh;
    width: 100vw;
  }
</style>
