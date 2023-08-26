<script lang="ts">
  import path from "path-browserify";

  interface ImageSequenceData {
    images: string[];
  }

  export let dir: string;
  export let idx: number = 0;
  export let alt: string = "";
  export let width: number | string | undefined = undefined;
  export let height: number | string | undefined = undefined;

  let imgUrls: string[] = [];
  $: {
    imgUrls = [];
    fetch(path.join(dir, "img.json"))
      .then(async response => {
        const data: ImageSequenceData = await response.json();
        imgUrls = preload(dir, data.images);
      })
  }

  function preload(dir: string, imgs: string[]): string[] {
    const imgUrls: string[] = [];
    imgs.forEach(img => {
      const imgUrl = path.join(dir, img);
      const imgObj = new Image();
      imgObj.src = imgUrl;
      imgUrls.push(imgUrl);
    });
    return imgUrls;
  }


</script>

<img src={imgUrls[idx] ?? ""} {width} {height} {alt}>

<style>
  img {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
</style>