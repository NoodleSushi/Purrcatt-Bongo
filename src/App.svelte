<script lang="ts">
  import ImageSequence from "./lib/ImageSequence.svelte";
  import * as Tone from "tone";
  import { makeNoise2D } from "fast-simplex-noise";
  import Spamtector from "./lib/Spamtector";
  import Interatector from "./lib/Interatector";
  import MIDItector from "./lib/MIDItector";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import spaceBgUrl from "./assets/space-bg.png";

  MIDItector.init();
  MIDItector.noteOn = (note, _) => bongoInteract((Math.floor(note / 2)) % 2, true); 
  MIDItector.noteOff = (note) => bongoInteract((Math.floor(note / 2)) % 2, false);  

  let isActive = false;
  async function startContext() {
    await Tone.start();
    isActive = true;
  }

  const makeNoise = makeNoise2D();
  const spamtector = new Spamtector();
  const isSpammingStore = spamtector.isSpamming$;
  const interatector = new Interatector();
  const interactedStore = interatector.interacted$;
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
      epicness = lerp(epicness, 0, Math.pow(0.6, dt * 0.18));
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
  });

  interactedStore.subscribe((interacted) => {
    insOpacity.set(interacted ? 0 : 1);
  });

  const players: Tone.Player[] = [bongoLowPlayer, bongoHiPlayer];
  function bongoInteract(hand: number, press: boolean) {
    if (press && (catFrameIdx & (0b10 >> hand)) == 0) {
      players[hand].start();
      spamtector.press();
      interatector.interact();
      catFrameIdx |= 0b10 >> hand;
    } else if (!press && (catFrameIdx & (0b10 >> hand)) != 0) {
      catFrameIdx &= ~(0b10 >> hand);
    }
  }

  const keyDown = (e: KeyboardEvent) => {
    if (e.repeat)
      return;
    switch (e.key) {
      case "z":
        e.preventDefault();
        bongoInteract(0, true);
        break;
      case "x":
        e.preventDefault();
        bongoInteract(1, true);
        break;
    }
  };

  const keyUp = (e: KeyboardEvent) => {
    if (e.repeat)
      return;
    switch (e.key) {
      case "z":
        e.preventDefault();
        bongoInteract(0, false);
        break;
      case "x":
        e.preventDefault();
        bongoInteract(1, false);
        break;
    }
  }

  onMount(() => {
    insOpacity.set(1);
  });
</script>

<svelte:window on:keydown={keyDown} on:keyup={keyUp}/>
<div class="layer full-height"
  style:background-image={`url(${spaceBgUrl})`} 
  style:opacity={Math.min(epicness * 3, 1)} 
  style:background-position={`${elapsed}px ${elapsed}px`}
/>
<div class="layer" style:opacity={$insOpacity}>
  <center><img src="img/instructions.png" alt="instructions"></center>
</div>
<div class="layer content">
  <div
    style:transform={`translate(${catX}px, ${catY}px) scale(${catScale}, ${catScale})`}
  >
    <ImageSequence width="500px" dir="img/cat-bongo" idx={catFrameIdx}/>
  </div>
</div>
<div class="layer touch full-height">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="touchpad"
    on:mousedown={(e) => {if (e.button == 0) bongoInteract(0, true)}}
    on:mouseup={(e) => {if (e.button == 0) bongoInteract(0, false)}}
    on:touchstart|preventDefault ={() => bongoInteract(0, true)}
    on:touchend|preventDefault ={() => bongoInteract(0, false)}
  />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="touchpad"
    on:mousedown={(e) => {if (e.button == 0) bongoInteract(1, true)}}
    on:mouseup={(e) => {if (e.button == 0) bongoInteract(1, false)}}
    on:touchstart|preventDefault ={() => bongoInteract(1, true)} 
    on:touchend|preventDefault ={() => bongoInteract(1, false)} 
  />
</div>
<div class="layer" style:opacity={$insOpacity}>
  <p>
    <a href="https://twitter.com/noodle_sushi" target="_blank">
      <img src="img/twthandle1.png" alt="twthandle1" height="32px"/>
    </a>
  </p>
  <p>
    <a href="https://twitter.com/hontakai" target="_blank">
      <img src="img/twthandle2.png" alt="twthandle2" height="32px"/>
    </a>
  </p>
</div>
{#if !isActive}
  <button class="layer content borderless"
    on:click={startContext} 
    style:background-color="#fffffff0"
  >
    <img src="img/mobile.png" alt="mobileins"/>
  </button>
{/if}

<style>
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
  }
  
  .touch {
    display: flex;
  }

  .touchpad {
    flex-grow: 2;
  }

  .layer {
    position: fixed;
    width: 100vw;
  }

  .full-height {
    height: 100vh;
  }

  .borderless {
    border: 0 none #000;
  }
</style>
