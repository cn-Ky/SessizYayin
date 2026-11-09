import type { Scene } from './types';

// Bölüm 1: kıyı → telsiz odası → arşiv
export const scenes1: Scene[] = [
  {
    id: 'intro',
    env: 'shore',
    title: 'KIYIKALE',
    lines: [
      'Gece yarısını yirmi dakika geçiyor. Fırtına denizi dövüyor.',
      'Üç gündür kardeşin Elif’ten haber yok. Son sinyali Kıyıkale Feneri’nden geldi.',
      'Fener yıllardır terk edilmiş. Ama tepesinde, tam şu anda, bir ışık dönüyor.',
      'Cebindeki telsiz bir an cızırdıyor.',
    ],
    scare: 'static',
    choices: [
      { text: 'Telsize cevap ver', to: 'shore_call', set: ['answeredCall'] },
      { text: 'Doğruca feneri’ne yürü', to: 'lobby' },
    ],
  },
  {
    id: 'shore_call',
    env: 'shore',
    speaker: 'ELİF (telsiz)',
    lines: [
      '“Deniz? Sen misin? Duyuyorsan sakın ışığa bakma.”',
      '“Işık seni bulmadan önce içeri gir. Ve… ne olursa olsun, onu dinleme.”',
      'Hat kesiliyor. Kimden bahsettiğini sormaya fırsat bulamıyorsun.',
    ],
    choices: [{ text: 'Feneri’ne yürü', to: 'lobby', sanity: -5 }],
  },
  {
    id: 'lobby',
    env: 'lobby',
    title: 'GİRİŞ HOLÜ',
    lines: [
      'Kapı kilitli değil. İçerisi buz gibi ve çürümüş tuz kokuyor.',
      'Zeminde ıslak ayak izleri var. İçeri girenler ve… dışarı çıkanlar. Hepsi aynı ayaktan.',
      'Camın ardından bir ışık süzülüyor. Biri, elinde fenerle, kıyıdan yaklaşıyor.',
    ],
    scare: 'figure',
    choices: [
      { text: 'Masanın arkasına saklan', to: 'lobby_hide', set: ['hidAtLobby'], danger: -10 },
      { text: 'Telsiz odasına koş', to: 'radio', danger: 10 },
    ],
    timer: { seconds: 14, to: 'radio' },
  },
  {
    id: 'lobby_hide',
    env: 'lobby',
    lines: [
      'Nefesini tutuyorsun. Kapı gıcırdıyor.',
      'Gölge holün ortasında duruyor. Elinde bir fener, omuzlarında ıslak bir mont.',
      'Alçak sesle bir ninni mırıldanıyor. Senin çocukluğundan bildiğin ninni.',
      'Sonra duruyor. Başını yavaşça sana çeviriyor. Yüzünü göremiyorsun, sadece ışığı.',
      'Işık üzerinden geçiyor. Ama bir saniye fazla kalıyor.',
    ],
    scare: 'flash',
    choices: [{ text: 'Gölge uzaklaşınca telsiz odasına git', to: 'radio', set: ['sawFigure'], sanity: -10 }],
  },
  {
    id: 'radio',
    env: 'radio',
    title: 'TELSİZ ODASI',
    lines: [
      'Eski bir verici masada hâlâ açık. Kadranlar kendi kendine oynuyor.',
      'Masanın üstünde bir kayıt defteri ve bir kaset duruyor. Kasetin üzerinde senin el yazınla bir not: “DENİZ”.',
      'Hiç yazdığını hatırlamıyorsun.',
    ],
    choices: [
      { text: 'Kayıt defterini oku', to: 'radio_log', set: ['readLog'], hidden: ['readLog'] },
      { text: 'Kaseti cebine koy', to: 'archive', set: ['hasTape'] },
      { text: 'Vericiyi parçala', to: 'radio_break', set: ['brokeRadio'], sanity: -15, danger: 15 },
      { text: 'Arşive geç', to: 'archive' },
    ],
  },
  {
    id: 'radio_log',
    env: 'radio',
    lines: [
      'Sayfalar nemden dalgalanmış. Yazı senin yazın.',
      '“Gün 1: Elif’in son sinyalini aldım. Feneri’ne gidiyorum.”',
      '“Gün 2: Fırtına. Köprüyü geçerken ayağım kaydı. Su çok soğuktu.”',
      '“Gün 3: Elif beni çağırıyor. Cevap veriyorum ama beni duymuyor.”',
      'Son satırın altı boş. Kalem hâlâ sayfanın üzerinde, titriyor.',
    ],
    scare: 'static',
    choices: [{ text: 'Kaseti al ve arşive geç', to: 'archive', set: ['hasTape'], sanity: -10 }],
  },
  {
    id: 'radio_break',
    env: 'radio',
    lines: [
      'Dipçikle vericiyi ezmeye başlıyorsun. Kadran camı patlıyor.',
      'Hoparlörden bir çığlık yükseliyor. Senin sesin. Ama sen susuyorsun.',
      'Elif’in telsiz sesi bir saniyeliğine çıkıyor: “Hayır, kırma, onu bırak, o benim…”',
      'Sonra sessizlik. Kulaklarında çınlama kalıyor.',
    ],
    scare: 'blackout',
    choices: [{ text: 'Arşive geç', to: 'archive' }],
  },
  {
    id: 'archive',
    env: 'archive',
    title: 'KAYIT ARŞİVİ',
    lines: [
      'Duvarlar boyunca yüzlerce bant. Hepsinin etiketi aynı: DENİZ ARAS.',
      'Raflar arasında, çok uzakta, bir fener ışığı geziyor. Yaklaşıyor.',
      'Yukarı çıkan demir merdiven senin arkanda.',
    ],
    choices: [
      { text: 'Kaseti çal', to: 'tape_play', requires: ['hasTape'] },
      { text: 'Merdivenden yukarı çık', to: 'stairs', danger: 10 },
    ],
    timer: { seconds: 16, to: 'stairs' },
  },
];
