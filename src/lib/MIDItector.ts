interface MIDITectorType {
  midiAccess: MIDIAccess | null;
  init: () => void;
  noteOn: (note: number, velocity: number) => void;
  noteOff: (note: number) => void;
}

const MIDITector: MIDITectorType = {
  midiAccess: null,
  init: function() {
    if (!this.midiAccess) {
      navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    }
  },
  noteOn: (note: number, velocity: number) => { },
  noteOff: (note: number) => { },
};

function onMIDISuccess(midiAccess: MIDIAccess) {
  console.log("MIDI Successful");
  for (var input of midiAccess.inputs.values()) {
    input.onmidimessage = (ev: Event) => getMIDIMessage(ev as MIDIMessageEvent);
  }
}

function onMIDIFailure(msg: any) {
  console.error(`Failed to get MIDI access - ${msg}`);
}

function getMIDIMessage(message: MIDIMessageEvent) {
  var command = message.data[0];
  var note = message.data[1];
  var velocity = (message.data.length > 2) ? message.data[2] : 0;

  switch (command) {
    case 144:
      if (velocity > 0) {
        MIDITector.noteOn(note, velocity);
      } else {
        MIDITector.noteOff(note);
      }
      break;
    case 128:
      MIDITector.noteOff(note);
      break;
  }
}

export default MIDITector;