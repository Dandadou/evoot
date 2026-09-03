export const VIRTUAL_CLASSROOM_LIMITS={
  /** Total connected people including trainers. */
  maxParticipants:30,
  /** Keep the browser light: render only a useful page of live cameras at once. */
  maxVisibleVideos:12,
  /** Above this count EVOOT should favor active-speaker/paginated layouts. */
  activeSpeakerThreshold:12,
  /** Target capture quality for normal classroom cameras. */
  camera:{width:640,height:360,frameRate:24},
} as const;

export function classroomCapacity(connected:number){
  const max=VIRTUAL_CLASSROOM_LIMITS.maxParticipants;
  return {connected,max,remaining:Math.max(0,max-connected),full:connected>=max};
}
