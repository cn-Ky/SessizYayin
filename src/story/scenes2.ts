import type { Scene } from './types';

// Bölüm 2: bant → merdiven → fener odası → mahzen → ayna (ters köşe)
export const scenes2: Scene[] = [
  {
    id: 'tape_play',
    env: 'archive',
    speaker: 'BANT',
    lines: [
      'Kaseti eski bir çaldıra takıyorsun. Önce su sesi. Sonra boğuk bir çığlık.',
      'Senin sesin: “Elif! Buradayım! Beni duy!” Üstüne bir dalga kapanıyor.',
      'Ardından Elif’in sesi, çok yakından: “Lütfen dön. Ben seni bırakmadım.”',
      'Bant kendi kendine geri sarıyor. Bir kez daha. Bir kez daha.',
    ],
    scare: 'static',
    choices: [
      { text: 'Sesi dinle, ona güven', to: 'stairs', set: ['trustedVoice'], sanity: -10 },
      { text: 'Kaseti parçala', to: 'end_yanki', set: ['burnedTapes'] },
    ],
  },
  {
    id: 'stairs',
    env: 'stairs',
    title: 'SPİRAL MERDİVEN',
    lines: [
      'Merdiven sonsuz. Her kat öncekinin aynısı, aynı çatlak, aynı su lekesi.',
      'Aşağıda biri çıkıyor. Basamaklar ıslak, adımlar yavaş. Ninni sesi.',
      'Ayakkabılarının sesini duymuyorsun. Kendi nefesini de duymuyorsun.',
    ],
    scare: 'figure',
    choices: [
      { text: 'Yukarı koş', to: 'lamp', danger: 15 },
      { text: 'Duvardaki girintiye gizlen', to: 'stairs_hide', danger: -10 },
      { text: 'Aşağı in, sesin peşine düş', to: 'cellar', requires: ['trustedVoice'], sanity: -10 },
    ],
    timer: { seconds: 12, to: 'lamp' },
  },
  {
    id: 'stairs_hide',
    env: 'stairs',
    speaker: 'ELİF',
    lines: [
      'Gölge tam önünde duruyor. Fener elinde titriyor.',
      '“Biliyorum buradasın,” diyor kısık bir sesle. “Kokunu alıyorum. Tuz ve gül suyu.”',
      'Bu Elif’in sesi. Ama korkudan kırılmış.',
      'Gözlerini yumuyorsun. Işık yüzünden geçiyor ve içinden sızıyor.',
    ],
    scare: 'flash',
    choices: [
      { text: 'Sessiz kal', to: 'end_sessizlik' },
      { text: 'Fısılda: “Elif?”', to: 'lamp', set: ['answeredCall'], sanity: -10 },
    ],
  },
  {
    id: 'lamp',
    env: 'lamp',
    title: 'FENER ODASI',
    lines: [
      'Dev mercek gecenin içinde döndükçe oda bir görünüp bir kayboluyor.',
      'Aşağıda, kayalıklarda bir bot ve birkaç el feneri var. Dalgıçlar. Bir arama ekibi.',
      'Ekibin önünde, elinde fenerle, Elif. Ve bir telsiz. Hepsi sana bakmıyor, bakıyor gibi bile durmuyor.',
      'Cam yüzeyinde kendi yansımanı arıyorsun. Cam boş.',
    ],
    choices: [
      { text: 'Ellerine bak', to: 'lamp_hands', set: ['readLog'], sanity: -20 },
      { text: 'Fener ışığını söndür', to: 'lamp_off', danger: -15 },
    ],
  },
  {
    id: 'lamp_hands',
    env: 'lamp',
    lines: [
      'Ellerin soluk. Parmak uçlarından su damlıyor ama zemine düşmüyor.',
      'Telsizi cebinden çıkarıyorsun. Hiç açık değil. Hiç açık olmamış.',
      'Üç gün önce bu köprüde ayağın kaymıştı. Sonrasını hatırlamıyorsun. Çünkü sonrası yok.',
    ],
    scare: 'blackout',
    choices: [{ text: 'Sese doğru in', to: 'cellar', sanity: -10 }],
  },
  {
    id: 'lamp_off',
    env: 'lamp',
    lines: [
      'Anahtarı çeviriyorsun. Mercek yavaş yavaş duruyor, ışık sönüyor.',
      'Aşağıdaki arama ekibi bir an duraksıyor. Biri bağırıyor: “Işık gitti!”',
      'Elif’in feneri tek başına titriyor. “Deniz,” diyor kimseye. “Yine sen misin?”',
    ],
    scare: 'blackout',
    choices: [{ text: 'Mahzene in', to: 'cellar' }],
  },
  {
    id: 'cellar',
    env: 'cellar',
    title: 'MAHZEN',
    lines: [
      'Zemin su dolu. Ayak bileğine kadar. Ama su ıslatmıyor.',
      'Ortada bir masa ve üstünde bir mikrofon. Telsizin yayınladığı ses buradan geliyor.',
      'Duvardaki aynanın önünde yırtılmış bir mont asılı. Senin montun.',
      'Arkandan ninni yükseliyor. Çok yakın.',
    ],
    scare: 'figure',
    choices: [
      { text: 'Mikrofona konuş', to: 'mirror', set: ['openedCellar'] },
      { text: 'Gölgenin yanından geçip kaç', to: 'end_kacis', danger: 20 },
      { text: 'Bandı tekrar çal', to: 'end_dongu', requires: ['hasTape'] },
    ],
    timer: { seconds: 18, to: 'end_kacis' },
  },
  {
    id: 'mirror',
    env: 'mirror',
    title: 'AYNA',
    speaker: 'ELİF',
    lines: [
      'Mikrofona “Elif” diyorsun. Mahzenin her yerinden sesin yankılanıyor.',
      'Ayna kendi kendine açılıyor. Aynanın içinde fener ışığı, ve ışığın ardında Elif.',
      'Yanaklarından yaş akıyor. Elleri titrerken mikrofonu sıkıca tutuyor. Karşısındaki mikrofon.',
      '“Üç gündür seni çağırıyorum. Sen de gece gece beni korkutuyorsun. Telsizi açıp kapıyorsun.”',
      'Kapıları çarpan, bantları geri saran, ayak izleri bırakan, ninni mırıldanan sendin.',
      'Işıklı gölge canavar değildi. Elif’ti. Sen, onun yas tuttuğu hayaletsin.',
    ],
    scare: 'flash',
    choices: [
      { text: 'Elif’e uzan', to: 'end_gercek', requires: ['readLog'] },
      { text: 'Elif’e uzan', to: 'end_gercek', requires: ['trustedVoice'], hidden: ['readLog'] },
      { text: 'Elif’e yaklaş', to: 'end_yanki', hidden: ['readLog', 'trustedVoice'] },
      { text: 'Işığı söndür, ona görünme', to: 'end_sessizlik' },
      { text: 'Geri çekil, kaç', to: 'end_kacis' },
    ],
  },
  // --- SONLAR ---
  {
    id: 'end_gercek',
    env: 'mirror',
    ending: 'gercek',
    title: 'SON: GÜN AĞARIYOR',
    lines: [
      'Elini aynaya koyuyorsun. Elif’inki karşılık veriyor. Cam soğuk değil, ılık.',
      '“Seni bırakmıyorum,” diyor, “ama seni de tutmuyorum artık.”',
      'Fener ışığı bir kez daha dönüyor ve bu kez içinden geçmek acıtmıyor.',
      'Sabaha karşı dalgıçlar kıyıda bir mont buluyor. Elif onu uzun süre kucağında tutuyor.',
      'Telsizdeki cızırtı kesiliyor. Sessizlik ilk kez bir hayalet için bile huzurlu.',
    ],
  },
  {
    id: 'end_kacis',
    env: 'cellar',
    ending: 'kacis',
    title: 'SON: HAYALET KAÇIŞI',
    lines: [
      'Elif’in ışığından kaçıyorsun. Merdivenden, holden, kıyıdan.',
      'Kaçtıkça fener seni kovalıyor sanıyorsun. Oysa yalnızca seni arıyor.',
      'Her gece aynı yola dönüyorsun. Ve her gece biri o ışıkla sana sesleniyor.',
      'Kıyıkale’de hâlâ ışık yanıyor. Bazen cızırtının arasında bir ad duyulur.',
    ],
  },
  {
    id: 'end_yanki',
    env: 'archive',
    ending: 'yanki',
    title: 'SON: YANKI',
    lines: [
      'Bant parçalanıyor. Seni dünyaya bağlayan son ses de onunla birlikte susuyor.',
      'Elif’in sesi gittikçe uzaklaşıyor. Sana “dön” diyen ses artık seni duymuyor.',
      'Arşivin raflarında bantlar kendi kendine dönüyor. Etiketlerde yalnızca bir yankı kalıyor.',
      'Ve fener, bir daha hiç yanmıyor.',
    ],
  },
  {
    id: 'end_sessizlik',
    env: 'stairs',
    ending: 'sessizlik',
    title: 'SON: SESSİZ YAYIN',
    lines: [
      'Karanlığa çekiliyorsun. Hiçbir şeye dokunmuyor, kimseye görünmüyorsun.',
      'Elif ışığı bir süre daha tutuyor, sonra yavaşça indiriyor.',
      'Telsiz son kez cızırdıyor: “Sen buradasın, değil mi?” Sessizlik cevap veriyor.',
      'Yayın kesiliyor. Fener sönüyor. Gece yeniden kendi sessizliğine dönüyor.',
    ],
  },
  {
    id: 'end_dongu',
    env: 'cellar',
    ending: 'dongu',
    title: 'SON: DÖNGÜ',
    lines: [
      'Bandı tekrar çalıyorsun. Su sesi. Çığlık. “Lütfen dön.”',
      'Sonra kendini kıyıda buluyorsun. Gece yarısını yirmi dakika geçiyor.',
      'Cebinde telsiz cızırdıyor. Üç gündür kardeşinden haber yok.',
      'Üstelik ışık, tepede, dönüyor. Bu kez yürümeden önce durup düşünüyorsun. Ama yine de yürüyorsun.',
    ],
  },
];
