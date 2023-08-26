<script lang="ts">
  import ImageSequence from "./lib/ImageSequence.svelte";
  import * as Tone from "tone";
  import { makeNoise2D } from "fast-simplex-noise";
  import Spamtector from "./lib/Spamtector";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import spaceBgUrl from "./assets/space-bg.png";

  let bongoHi = new Tone.Player("audio/bongo-hi.wav").toDestination();
  let bongoLow = new Tone.Player("audio/bongo-low.wav").toDestination();
  let bongoTrip = new Tone.Player("audio/bongotrip.mp3").toDestination();
  bongoTrip.loop = true;
  bongoTrip.fadeIn = 5;
  bongoTrip.fadeOut = 0.5;
  let idx = 0;
  let epicness = 0;
  let spamtector = new Spamtector();
  const insOpacity = tweened(0, {duration: 400, easing: cubicOut});
  const isSpammingStore = spamtector.isSpamming$;
  isSpammingStore.subscribe((isSpamming) => {
    if (isSpamming)
      bongoTrip.start();
    else
      bongoTrip.stop();
  })

  const makeNoise = makeNoise2D();

  const keyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    if (e.repeat)
      return;
    switch (e.key) {
      case "z":
        bongoLow.start();
        spamtector.press();
        idx |= 0b10;
        break;
      case "x":
        bongoHi.start();
        spamtector.press();
        idx |= 0b01;
        break;
    }
  };

  const keyUp = (e: KeyboardEvent) => {
    e.preventDefault();
    if (!e.repeat) {
      switch (e.key) {
        case "z":
          idx &= ~0b10;
          break;
        case "x":
          idx &= ~0b01;
          break;
      }
    }
  }

  function lerp(a: number, b: number, alpha: number) {
    return a + alpha * (b - a);
  }

  let startTime: DOMHighResTimeStamp;
  let lastTime: DOMHighResTimeStamp;
  let elapsed: number = 0;
  let speed: number = 0.008;

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

  onMount(() => {
    insOpacity.set(1);
    setTimeout(() => {
      insOpacity.set(0);
    }, 4000);
  });

</script>

<svelte:head>
  <title>Purrcatt Bongo</title>
</svelte:head>

<svelte:window on:keydown={keyDown} on:keyup={keyUp}/>

<div class="background" style:background-image={`url(${spaceBgUrl})`} style:opacity={Math.min(epicness * 3, 1)} style:background-position={`${elapsed}px ${elapsed}px`}/>
<div />
<div class="ins" style:opacity={$insOpacity}>
  <center><img src="img/instructions.png" alt="instructions"></center>
</div>
<div class="content">
  <div
    style:transform={`translate(${(epicness * 50 * makeNoise(elapsed * speed, 0))}px, ${(epicness * 50 * makeNoise(elapsed * speed, 100))}px) scale(${epicness * 0.5 + 1}, ${epicness * 0.5 + 1})`}
  >
    <ImageSequence width="500px" dir="img/cat-bongo" {idx}/>
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

  .background {
    position: fixed;
    height: 100vh;
    width: 100vw;
  }

  .ins {
    position: fixed;
    width: 100vw;
  }
</style>
