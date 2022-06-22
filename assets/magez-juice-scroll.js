$(function () {
  let inTouch;
  $(document).on('touchstart',function(e){
    inTouch = true;
  })
  $('.juice-txt').css({
    top:`${window.innerHeight/2}px`
  });
  let duration = window.innerWidth < 768 || inTouch ? 1000 : 4000;
  let scene1_dur_offset = window.innerWidth < 768 || inTouch ? '+=0.01' : '+=0.03',
      scene1_dur_offset_last_two = window.innerWidth < 768 || inTouch ? '+=0.01' : '+=0.08',
      juice1_dur_start = window.innerWidth < 768 || inTouch ? 0.02 : 0.05;
  let txt_dur = window.innerWidth > 1279? 0.2 : 0.01;
  let tlFirstScroll = new TimelineMax();
  tlFirstScroll
    .set(['.detail-item-txt-1', '.detail-item-txt-2', '.detail-item-txt-3'], { display: 'none', autoAlpha: 0 })

    .to('.detail-item-txt-1', txt_dur, { display: 'block', autoAlpha: 1 })
    
    .set('.juice-1', { display: 'none', autoAlpha: 0 },'+=0')
 
    .set('.juice-2', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-3', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-4', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-5', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-6', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-7', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-8', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-9', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-10', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-11', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-12', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-13', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-14', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-15', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-16', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-17', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-18', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-19', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-20', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-21', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-22', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .fromTo('.detail-item-txt-1', txt_dur, {autoAlpha:1,y:0},{ display: 'none', autoAlpha: 0 ,y:30},'-=0.1')
    .fromTo('.detail-item-txt-2',txt_dur,{y:30},{y:0},'-=0.2')
    .to('.detail-item-txt-2', txt_dur, { display: 'block', autoAlpha: 1 },'-=0.2')

    .set('.juice-23', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-24', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-25', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-26', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-27', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-28', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-29', { display: 'none', autoAlpha: 0 },scene1_dur_offset)
    
    .set('.juice-30', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-31', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-32', { display: 'none', autoAlpha: 0 },scene1_dur_offset)

    .set('.juice-33', { display: 'none', autoAlpha: 0 },scene1_dur_offset_last_two)

    .set('.juice-34', { display: 'none', autoAlpha: 0 },scene1_dur_offset_last_two)

//     .set('.juice-35', { display: 'none', autoAlpha: 0 },scene1_dur_offset_last_two)
  
  let controller = new ScrollMagic.Controller();
  new ScrollMagic.Scene({
    triggerElement: '#trigger-elem',
    triggerHook: 0,
    duration: duration,
  })
    .setTween(tlFirstScroll)
    .setPin('#trigger-elem')
    // .addIndicators()
    .addTo(controller)
})  