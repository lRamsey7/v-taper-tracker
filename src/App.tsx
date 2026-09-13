import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ---------- SUPABASE ---------- */
const SUPABASE_URL = 'https://eltpcfbfpcdbwnqskhcu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdHBjZmJmcGNkYnducXNraGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMjYzOTcsImV4cCI6MjEwNDkwMjM5N30.sniMKw5fmIvsI5K06nX-Nf7f6GZQLp-hD4-4nBQe0_g';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- PROGRAM DATA ---------- */
const DAY_META: Record<number, { label: string; sub: string; color: string }> = {
  1: { label: 'ÜST VÜCUT', sub: 'Karşıt kas akışı', color: '#8ab4d8' },
  2: { label: 'ALT VÜCUT', sub: 'Ön bacak baskın', color: '#d8a8d0' },
  4: { label: 'PUSH', sub: 'Göğüs — Omuz — Triceps', color: '#d8c48a' },
  5: { label: 'PULL', sub: 'Sırt — Arka Omuz — Ön Kol', color: '#a8d8c0' },
  6: { label: 'LEGS', sub: 'Kalça — Bacak', color: '#d8938a' },
};
const DAY_ORDER = [1, 2, 4, 5, 6];
const WD_TO_DAY: Record<number, number> = { 1: 1, 2: 2, 3: 0, 4: 4, 5: 5, 6: 6, 0: 0 };
const WEEK_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTH_LABELS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const TIER_COLOR: Record<string, string> = { heavy: '#d3603f', medium: '#c99a3d', light: '#7fa878', special: '#6a93b8' };
const TIER_LABEL: Record<string, string> = { heavy: 'Ağır · RIR 1-2', medium: 'Orta · RIR 2', light: 'Hafif · RIR 0-1', special: 'Özel Bölge' };

interface Exercise {
  id: string; name: string; sets: number; reps: string; rest: string; tier: string;
  grip?: string; target: string; form: string; warn: string; aesthetic: string;
  personalNote?: string; home?: boolean; optional?: boolean; freq?: string;
}

const PROGRAM: Record<number, Exercise[]> = {
  1: [
    { id:'incline-db-press', name:'Incline DB Press', sets:3, reps:'8-10', rest:'2.5-3 dk', tier:'heavy', grip:'Pron (avuç ileri)', target:'Üst Göğüs & Ön Omuz (Pectoralis Major – Clavicular Baş)',
      form:'Sehpayı 30° eğime getir. Sırtını sehpaya tam yasla. Dirsekleri tam yana (90°) açmak yerine gövdenden hafif uzakta, ~45°lik açıda tut; bu omzunu korur.',
      warn:'Dirsekleri çok yana açmak ön omuz tendonlarını sıkıştırır (subakromiyal sıkışma riski).',
      aesthetic:'Üst göğüs liflerini doldurur, omuz-göğüs birleşimindeki hattı belirginleştirir.' },
    { id:'seated-cable-row', name:'Seated Cable Row (Orta-Geniş Nötr Bar)', sets:3, reps:'8-12', rest:'2-2.5 dk', tier:'heavy', grip:'Nötr', target:'Orta/Üst Sırt Kalınlığı (Latissimus Dorsi, Rhomboids, Trapezius)',
      form:"Ayaklarını footplate'e sabitle, dizlerini hafif bük. Dik otur, göğsünü kabart. Çekerken gövdeni geriye yaslayıp kalkma; tutamağı karnının üstüne doğru çek.",
      warn:'Gövdeni geriye yatırıp kalkarak çekersen yük belden sırta kayar; sakatlanma riski taşır.',
      aesthetic:'Sırtın ortasını ve derinliğini doldurur, arkadan bakıldığında kütle katar.' },
    { id:'pec-deck-fly', name:'Pec Deck Fly', sets:3, reps:'10-12', rest:'90 sn', tier:'light', grip:'—', target:'Göğüs İç/Orta Lifler (Pectoralis Major – Sternal Baş)',
      form:'Koltuk yüksekliğini tutamaklar göğüs hizasında olacak şekilde ayarla. Sırtını pede tam yasla, omuzlarını hafif geriye sabitle. Dirsekleri (elleri değil) birbirine yaklaştır.',
      warn:'Omuzlar öne kayarsa hareketin çoğunu ön omuz kası üstlenir, göğüs daha az çalışır.',
      aesthetic:'Göğsün ortasındaki ayrım çizgisini derinleştirir.' },
    { id:'wide-lat-pulldown', name:'Wide-Grip Lat Pulldown', sets:3, reps:'10-12', rest:'2 dk', tier:'medium', grip:'Pron/Geniş', target:'Üst Sırt & Sırt Genişliği (Latissimus Dorsi, Teres Major)',
      form:'Diz pedini uyluklarına tam temas edecek şekilde ayarla. Gövdeni hafifçe (~10-15°) geriye yasla. Barı çene/köprücük kemiği hizasına çek.',
      warn:'Ense arkasına çekme; gövdeyi aşırı geriye yatırıp kucağa çekmek sallanmaya döner.',
      aesthetic:"Sırt çatısını yana genişleterek V-Taper formunu çizer." },
    { id:'db-lateral-raise', name:'DB Lateral Raise (Ana Hareket)', sets:3, reps:'10-12', rest:'90 sn', tier:'heavy', grip:'Nötr', target:'Yan Omuz (Deltoid – Lateral Baş)',
      form:'Ayakta dur, gövdeni hafif (5-10°) öne eğ. Kolları tam yandan değil, gövdenin ~30° önünden kaldır. Serçe parmağı yukarı çevirme.',
      warn:'Serçe parmağını yukarı çevirmek omuzda sıkışma hissine yol açabilir.',
      aesthetic:"Yan omuzu yuvarlayarak V-Taper'ın en belirleyici hattını oluşturur.", personalNote:'7.5 kg ile 10-12 tekrar hedefin; haftalık yan omuz hacminin ana taşıyıcısı.' },
    { id:'preacher-curl', name:'Preacher Curl (Z-Bar)', sets:3, reps:'10-12', rest:'60-90 sn', tier:'medium', grip:'Yarı-Supine', target:'Biceps İç Kısmı & Pazu Altı',
      form:'Kolunu koltuk altına kadar pede yasla. Ağırlığı indirirken dirseğini tam düzleştirme, son 5-10°de dur.',
      warn:'Dipte dirseği kilitlemek dirseğe yakın kirişe aşırı yük bindirir.',
      aesthetic:'Biceps iç kısmını doldurarak damar hattını belirginleştirir.' },
    { id:'triceps-pushdown', name:'Triceps Pushdown', sets:4, reps:'10-12', rest:'60-90 sn', tier:'light', grip:'Pron', target:'Triceps Dış Kısmı (Lateral Baş)',
      form:'Kabloyu baş üstü hizasına ayarla. Dirsekleri gövdenin yanına sabitle, sadece ön kolu aşağı it.',
      warn:'Dirsekler öne kayarsa göğüs/omuz devreye girer, triceps daha az çalışır.',
      aesthetic:'Arka kolun dış hattını belirginleştirir.' },
  ],
  2: [
    { id:'leg-press', name:'45° Leg Press / DB Squat', sets:4, reps:'8-10', rest:'2.5 dk', tier:'heavy', grip:'—', target:'Ön Bacak Kütlesi (Quadriceps Femoris)',
      form:'Ayakları platformun ortasında, omuz genişliğinde yerleştir. Bel/kalçanı pede tam yapıştır. Dizler 90° olana kadar yavaşça indir.',
      warn:'İterken dizleri kilitleme; kalçan pedden kalkıyorsa ağırlık fazla gelmiş demektir.',
      aesthetic:'Beli kalınlaştırmadan bacaklara dış kavis kazandırır.' },
    { id:'rdl', name:'Romanian Deadlift (RDL)', sets:3, reps:'8-10', rest:'2.5-3 dk', tier:'heavy', grip:'Pron', target:'Hamstring & Kalça (Biceps Femoris, Gluteus Maximus)',
      form:'Kalçanı geriye iterek başlat (hip hinge). Ağırlığı bacaklarına yakın tutup diz altına indir, sırt tüm hareket boyu dümdüz.',
      warn:'Sırtı yuvarlama; hareketi kalçanı sıkarak bitir.',
      aesthetic:'Arka bacak ile kalça ayrım çizgisini derinleştirir.' },
    { id:'leg-extension', name:'Leg Extension', sets:4, reps:'10-12', rest:'90 sn', tier:'light', grip:'—', target:'Ön Bacak İzolasyon (Rectus Femoris Ağırlıklı)',
      form:'Pivot noktasının diz kapağınla aynı hizada olduğundan emin ol. Sırtını pede dik yasla, geriye yatırma. Tepede 1-2 sn sık.',
      warn:'Ağırlığı düşürme; 2-3 saniyede yavaşça indir.',
      aesthetic:'Bacak liflerinin derinin altında ayrılmasını sağlar.' },
    { id:'lying-leg-curl', name:'Lying Leg Curl (Yüzüstü)', sets:3, reps:'10-12', rest:'90 sn', tier:'light', grip:'—', target:'Hamstring İzolasyon, Kalça Nötr',
      form:'Ayak bileği pedi topukların hemen üstüne denk gelsin. Kalçanı sehpaya yapıştır, kalça kalkmadan bük.',
      warn:'Çekiş anında bel çukurlaşmamalı.',
      aesthetic:'Bacağın arka profilini yandan doldurur.' },
    { id:'seated-hip-adductor', name:'Seated Hip Adductor', sets:3, reps:'10-12', rest:'90 sn', tier:'special', grip:'—', target:'İç Bacak Kası (Adductor Magnus, Longus)',
      form:'Sırtını pede dik yasla (öne eğilme). Bacaklarını kontrollü kapat, tepede sıkıştır.',
      warn:'Pedleri aniden açma; negatifi kontrollü uygula.',
      aesthetic:'İç bacak dolgunluğunu artırır.' },
    { id:'standing-calf', name:'Standing Calf Raise', sets:4, reps:'10-12', rest:'60 sn', tier:'light', grip:'—', target:'Kalfın Üst Kısmı (Gastrocnemius)',
      form:'Dizlerini tam kilitlemeyip hafif bükülü tut. Dipte 2 sn esnet, sonra yüksel.',
      warn:'Dizleri kilitlersen yük ekleme biner, kasa değil.',
      aesthetic:'Alt bacağa üst elmas formunu kazandırır.' },
    { id:'dragon-flag', name:'Dragon Flag', sets:3, reps:'5-8', rest:'90 sn', tier:'light', grip:'Pron', target:'Tüm Karın Bölgesi (Rectus Abdominis, Obliques)',
      form:'Sırtüstü uzan, başının arkasındaki sabit yeri iki elinle kavra. Sadece omuzların değsin; tüm vücudu tek düz çizgi halinde kaldır/indir.',
      warn:'Çok zorlu bir hareket; zorlanıyorsan dizleri bükerek veya sadece negatif (yavaş iniş) ile başla. Bel kavis yapmaya başlarsa bitir.',
      aesthetic:'Karnın tamamını tek seferde çalıştıran en yoğun hareketlerden biri.' },
  ],
  4: [
    { id:'seated-chest-press', name:'Seated Chest Press', sets:3, reps:'8-10', rest:'2.5-3 dk', tier:'heavy', grip:'Nötr/Pron', target:'Genel Göğüs Kütlesi',
      form:'Koltuk: tutamaklar göğüs ortasına (meme ucu hizası) gelsin, dirsekler başlangıçta omuz hizasının biraz altında kalsın. Sırtını dik yasla.',
      warn:'Koltuk çok alçaksa dirsekler omuz üstünde kalır, omuz zorlanır, göğüs az çalışır.',
      aesthetic:'Göğüs tabanına genel hacim ve kalınlık verir.' },
    { id:'pec-deck-fly-2', name:'Pec Deck Fly (1. Günle Aynı)', sets:3, reps:'10-12', rest:'90 sn', tier:'light', grip:'—', target:'Göğüs İç/Orta Lifler',
      form:'Koltuk yüksekliğini tutamaklar göğüs hizasında olacak şekilde ayarla. Dirsekleri yaklaştır, omuz öne kaymasın.',
      warn:'Omuzlar öne kayarsa göğüs daha az çalışır.',
      aesthetic:'Haftada 2. kez aynı hareketle çalışıyorsun; bilinçli bir tekrar.' },
    { id:'machine-shoulder-press', name:'Machine Shoulder Press', sets:3, reps:'8-10', rest:'2-2.5 dk', tier:'heavy', grip:'Pron', target:'Ön Omuz & Omuz Çatısı (Anterior Deltoid)',
      form:'Koltuk: tutamaklar başlangıçta omuz hizasında (kulak seviyesinin biraz altında). Sırtını dik yasla, geriye yatırma.',
      warn:'Geriye yatarsan hareket göğüs presine döner, ön omuz az çalışır.',
      aesthetic:'Omuz başlarına kütle katar, göğüs-omuz ayrımını belirginleştirir.' },
    { id:'cable-lateral-4', name:'Cable Lateral Raise — Düşen Ağırlık Tekniği', sets:3, reps:'5kg→2.5kg', rest:'90 sn', tier:'light', grip:'Nötr', target:'Yan Omuz (Gerçek Kapasiteye Göre)',
      form:"Makarayı bel/kalça hizasına getir, gövdeni hafif öne eğ. Önce 5 kg ile bitene kadar (~6-7 tekrar), hemen 2.5 kg'a düşürüp devam et (~8-12 tekrar daha). İkisi 1 set.",
      warn:'5-2.5 kg arasında ara ağırlık yok; 5 kg ile az tekrarda tükenmen normal, bu yüzden düşen ağırlık tekniği kullanıyoruz.',
      aesthetic:'Yan omzun en esnetildiği noktada yük vererek maksimum uyarı sağlar.' },
    { id:'overhead-triceps-ext', name:'Overhead Cable Triceps Extension (Halat)', sets:4, reps:'10-12', rest:'90 sn', tier:'medium', grip:'Nötr', target:'Triceps İç/Uzun Kısmı',
      form:'Kabloyu yere yakın ayarla. Halatı başının arkasına indir, dirsekleri şakaklarına yakın sabit tut.',
      warn:'Dirsekleri dışa açma; sadece ön kolları hareket ettir.',
      aesthetic:"Pushdown'dan farklı kısmı çalıştırır; ikisi birbirini tekrar etmez." },
    { id:'supported-shrug', name:'Supported DB Shrug', sets:2, reps:'10-12', rest:'2 dk', tier:'medium', grip:'Nötr', target:'Üst ve Orta Trapez',
      form:'Sehpayı ~75° ayarla, göğsünü pede yasla. Omuz başlarını kulaklara doğru dikey çek, 1 sn bekle.',
      warn:'Dairesel döndürme; sadece dikey çek.',
      aesthetic:'Omuz-boyun geçişine güçlü bir trapez formu verir.' },
    { id:'pushup-plus', name:'Feet-Elevated Push-Up Plus', sets:3, reps:'12-15', rest:'60 sn', tier:'special', grip:'Pron', target:'Kaburga Yan Kasları (Serratus Anterior)', home:true,
      form:'Ayaklar sehpada, avuçlar hafif dışa dönük, dirsek ~45° açı (90° değil). Tepede kürek kemiklerini açarak sırtı ekstra it.',
      warn:'Avuçları hafif dışa çevirmek bilek kirişlerindeki bükülme stresini azaltır.',
      aesthetic:'Tırtıklı boksör kaslarını belirginleştirir.' },
    { id:'neck-curl-extension', name:'Boyun Kıvırma & Açma (Plaka ile)', sets:2, reps:'12-15 (her yön)', rest:'60 sn', tier:'light', grip:'—', target:'Boyun Kasları (Sternocleidomastoid, Boyun Ekstensörleri)', optional:true,
      form:'Sırtüstü uzan, başın sehpadan taşsın. Alnına hafif bir plaka/havlu tutarak (veya elle direnç vererek) çeneni göğsüne doğru kıvır (2 set). Sonra yüzüstü dönüp aynı şekilde başını geriye aç (2 set).',
      warn:'Çok hafif başla; boyun küçük ve hassas bir bölge, ağırlığı yavaş artır.',
      aesthetic:'Geniş omuzlarla birlikte kalın bir boyun, üst gövdenin genel kütle izlenimini güçlendirir.',
      personalNote:'Opsiyonel — zorunlu değil, ama omuz genişliğini tamamlayan gözden kaçan bir detay.' },
  ],
  5: [
    { id:'pull-up', name:'Underhand Grip Pull-Up', sets:3, reps:'6-10', rest:'2 dk', tier:'heavy', grip:'Supine', target:'Alt Kanat & Biceps',
      form:'Avuçlar kendine baksın. Çeneni bar seviyesinin üstüne çıkarana kadar çek; klasik ve güvenli derinlik budur.',
      warn:'Aşağı inerken kolları yavaşça salarak alt kanatları esnet.',
      aesthetic:'Kanat kaslarını bel hizasına kadar uzatır.' },
    { id:'neutral-lat-pulldown', name:'Medium Neutral Lat Pulldown', sets:3, reps:'8-10', rest:'2-2.5 dk', tier:'heavy', grip:'Nötr', target:'Üst Sırt Kanadı (Teres Major)',
      form:'Diz pedini sıkı ayarla, hafif geriye yasla. Barı çene/köprücük hizasına indir.',
      warn:'Barı zorla göğse indirmeye çalışmak dirseklerin geriye kaçmasına sebep olur.',
      aesthetic:"Kanatların dışa kavis yaptığı V-Taper çatısını inşa eder." },
    { id:'t-bar-row', name:'Chest-Supported T-Bar Row', sets:3, reps:'8-12', rest:'2 dk', tier:'heavy', grip:'Nötr', target:'Alt/Orta Sırt Kalınlığı',
      form:'Göğüs pedi göğsünün ortasına gelsin. Göğüs/karnını sehpaya tam yasla, göbek deliğine doğru çek.',
      warn:'Gövdeyi sallamadan tamamen göğüs desteğine güven.',
      aesthetic:"1. gündeki row'dan farklı düzlemde çalışarak bele inen lifleri doldurur." },
    { id:'face-pull', name:'Face Pull (Halat)', sets:3, reps:'12-15', rest:'60 sn', tier:'light', grip:'Nötr', target:'Arka Omuz (Rotator Cuff)',
      form:'Kabloyu yüz hizasına ayarla. Yüzüne çekerken elleri iki yana aç, dirsekler omuz üstünde.',
      warn:'Ağırlığı alına çekip arka omuzu sıkıştır.',
      aesthetic:'Duruşu dikleştirir, arka omuzu bilye gibi doldurur.' },
    { id:'reverse-pec-deck', name:'Reverse Pec Deck Fly', sets:3, reps:'12-15', rest:'60 sn', tier:'light', grip:'Nötr', target:'Arka Omuz (2. Hareket)',
      form:"Göğsünü pede yasla (normal Pec Deck Fly'ın tam tersi). Kolları hafif kavisli yana aç.",
      warn:'Gövdeyi sallamadan sadece kollarla yap.',
      aesthetic:'Omzun arkadan görünümüne 3D dolgunluk katar.' },
    { id:'incline-curl', name:'Incline Dumbbell Curl (45°)', sets:3, reps:'10-12', rest:'90 sn', tier:'medium', grip:'Supine', target:'Biceps Üst/Tepe Kısmı',
      form:'Sehpa 45°, sırtını tam yasla. Kollar gövdenin gerisinde sarkık dursun; tam gerilme sağlanır.',
      warn:'Dirsekleri öne kaydırma.',
      aesthetic:'Yüksek tepeli bir görünüm oluşturur.' },
    { id:'hammer-curl', name:'Hammer Curl', sets:3, reps:'10-12', rest:'75-90 sn', tier:'medium', grip:'Nötr', target:'Pazu Altı & Ön Kol (Brachialis)',
      form:'Ayakta dik dur, gövdeni sallamadan bükerek kaldır. Başparmaklar yukarı bakar.',
      warn:'Vücudu sallamadan stresi kolda tut.',
      aesthetic:'Pazunun alt katmanını büyüterek kol kalınlığını artırır.' },
    { id:'reverse-ezbar-curl', name:'Reverse Grip EZ-Bar Curl (Z-Bar)', sets:3, reps:'10-12', rest:'75-90 sn', tier:'medium', grip:'Pron', target:'Ön Kol Üst Kısmı (Brachioradialis)', optional:true,
      form:"Z-bar'ı avuç aşağı bakacak şekilde kavra. Z-bar'ın açılı tutamağı düz bara göre bileğe çok daha az yük bindirir.",
      warn:'Ağırlığı fazla artırma; bu tutuşta bilek/dirsek kirişleri daha kırılgandır.',
      aesthetic:'Ön kolun üst hattını kalınlaştırır.' },
    { id:'wrist-curl', name:'Bilek Kıvırma (Ön Kol İçi + Dışı)', sets:3, reps:'15-20 (her yön)', rest:'60 sn', tier:'light', grip:'Supine+Pron', target:'Ön Kol Kalınlığı', optional:true,
      form:'Ön kolunu dizine/sehpaya yasla, sadece bilek kenardan sarksın. Önce avuç yukarı (3 set), sonra avuç aşağı (3 set) kaldır.',
      warn:'Ağırlığı çok artırma; ağırlık fazla olursa dirsek devreye girer.',
      aesthetic:'Bilekten dirseğe dolgun bir görünüm sağlar; gömlek kolunda en çok fark edilen kısım.' },
  ],
  6: [
    { id:'hyperextension', name:'45° Glute Hyperextension', sets:3, reps:'10-12', rest:'2 dk', tier:'heavy', grip:'—', target:'Ana Kalça Kası (Horizontal Loading)',
      form:'Kalça pedini kıvrım çizgine ayarla. Ayak uçları 45° dışa, çene göğüste, üst sırt hafif kambur. Sadece kalçayı sıkarak yüksel.',
      warn:'Sırtı dümdüz tutup geriye bükmek yükü bel kaslarına bindirir.',
      aesthetic:'Kalçayı dikleştirir ve yuvarlak form verir.', personalNote:'Aynı kategori alternatifleri: Barbell Hip Thrust, Cable Pull-Through.' },
    { id:'bulgarian-split-squat', name:'DB Bulgarian Split Squat', sets:3, reps:'8-10', rest:'2 dk', tier:'heavy', grip:'Nötr', target:'Kalça Alt & Üst Bacak (Vertical Loading)',
      form:'Gövdeni 30° öne eğ. Kalçanı geriye ve aşağı indir.',
      warn:'Yükü ön bacağa değil kalça alt liflerine bindir.',
      aesthetic:'Kalça altı ile arka bacak birleşim çizgisini derinleştirir.' },
    { id:'seated-leg-curl', name:'Seated Leg Curl (Oturarak)', sets:3, reps:'10-12', rest:'90 sn', tier:'medium', grip:'—', target:'Hamstring (Maksimal Gerilme)',
      form:'Kalçan öne bükülü dursun; bu açı 2. günden farklı bir kısmı gerer. Topukları geriye çekerek bük.',
      warn:'Hızlandırma, negatifi kontrollü yap.',
      aesthetic:'Arka bacağa derin kütle katar.' },
    { id:'lateral-lunge', name:'Dambıllı Yana Hamle (Lateral Lunge)', sets:3, reps:'10-12/bacak', rest:'90 sn', tier:'medium', grip:'Nötr', target:'Yan Kalça & İç Bacak (Combinational Loading)',
      form:'Bir bacağınla yana geniş adım at, kalçanı geriye iterek dizini bük; diğer bacak düz kalsın.',
      warn:'Öne eğilip belden bükme; gövdeyi dik tut.',
      aesthetic:'Vertical+Lateral yüklemeyi birleştirir; programdaki diğer kalça hareketlerinden farklı, tamamlayıcı.', personalNote:'Aynı kategori alternatifleri: Curtsy Lunge, Cossack Squat.' },
    { id:'hip-adductor-abductor', name:'Seated Hip Adductor / Abductor', sets:3, reps:'12-15', rest:'60-90 sn', tier:'special', grip:'—', target:'İç Bacak & Yan Kalça (Lateral/Rotary Loading)',
      form:'İç bacak için kapat, dış kalça için aç. İkisinde de sırtını dik yasla, gövdeni hiç oynatma.',
      warn:'Güvenlik: koltuk/pedleri kalça genişliğine göre ayarla. Sırtında çekilme/ağrı hissedersen dur, ağırlığı azalt.',
      aesthetic:'Kalçanın yan-üst dolgunluğunu artırır.' },
    { id:'seated-calf', name:'Seated Calf Raise', sets:4, reps:'12-15', rest:'60 sn', tier:'light', grip:'—', target:'Alt/Yan Kalf (Soleus)',
      form:'Diz 90° bükülü, pedi diz üstüne yerleştir. Dipte 2 sn esnetip yüksel.',
      warn:'İvmeyle değil sadece kas gücüyle kaldır.',
      aesthetic:'Kalfın alt taraflarını doldurur.' },
    { id:'cable-lateral-6', name:'Cable Lateral Raise — Düşen Ağırlık (3. Frekans)', sets:3, reps:'5kg→2.5kg', rest:'90 sn', tier:'light', grip:'Nötr', target:'Yan Omuz (3. Frekans)',
      form:"4. günle birebir aynı hareket ve teknik: 5 kg bitene kadar, hemen 2.5 kg'a düşüp devam.",
      warn:'Ara ağırlık olmadığı için 5 kg ile az tekrarda tükenmen normal.',
      aesthetic:"Haftalık frekansı 3'e çıkararak omuz-omurga oranını genişletir." },
    { id:'pallof-press', name:'Pallof Press (Anti-Rotasyon)', sets:3, reps:'10-12/taraf', rest:'60-90 sn', tier:'medium', grip:'Nötr (çift el, göğüs önü)', target:'Yan Karın Stabilizasyonu (Obliques — Kalınlaştırmadan)',
      form:'Kabloyu göğüs hizasına ayarla, kabloya yan dur. Tutamağı iki elinle göğsünün önünde tut, kolları düz öne it. Kablonun seni yana çekme kuvvetine karşı gövdeni dönmeden sabit tut.',
      warn:'Gövdenin dönmesine izin verme; hareketin amacı dönmemek, döndürmek değil.',
      aesthetic:"Obliques'i ağırlıkla büyütüp beli kalınlaştırmak yerine, karın sıkılığını ve düz duruşu geliştirir — V-Taper'a daha uygun bir yaklaşım (ağır rotasyonel yükleme bel çevresini artırabilir)." },
  ],
};

const BONUS: Exercise[] = [
  { id:'dead-hang', name:'Dead Hang', sets:3, reps:'20-40sn', rest:'Serbest', tier:'light', grip:'Pron', target:'Kavrama Gücü & Omuz Sağlığı', freq:'Her gün yapılabilir',
    form:'Bara asıl, omuzları tamamen gevşet. Ayaklar yerden kesik, kollar düz.',
    warn:'Omuzda keskin ağrı hissedersen bırak.',
    aesthetic:'Sırtı uzatır, kavrama gücünü artırır, diğer çekiş hareketlerini destekler.' },
  { id:'plate-pinch', name:'Plaka Sıkma (Plate Pinch)', sets:3, reps:'20-40sn/el', rest:'30-60 sn', tier:'light', grip:'Pinch', target:'Ön Kol & Parmak Kavrama', freq:'Haftada 3+ kez',
    form:'İki diski düz yüzeyleri birbirine bakacak şekilde parmak uçlarınla sıkıp tut.',
    warn:'Diskler kayıp ayağına düşebilir; ayakları altta tutma.',
    aesthetic:'Ön kolun kavrama kaslarını doğrudan büyütür.' },
  { id:'farmers-carry', name:"Farmer's Carry", sets:3, reps:'20-30m', rest:'60-90 sn', tier:'medium', grip:'Nötr', target:'Kavrama, Trapez & Gövde Sıkılığı', freq:'Haftada 2-3 kez',
    form:'Ağır dambıl/kettlebell al, omuzları geri çekip dik dur, kısa adımlarla yürü.',
    warn:'Sırtı yuvarlama, gövdeyi dik tut.',
    aesthetic:'Trapez ve üst gövde sıkılığına katkı sağlar.' },
  { id:'band-pull-apart', name:'Band Pull-Apart', sets:3, reps:'15-20', rest:'30-45 sn', tier:'light', grip:'Pron', target:'Arka Omuz & Omuz Sağlığı', freq:'Her gün yapılabilir',
    form:'Bandı omuz genişliğinde kavra, iki yana açarak kürek kemiklerini sıkıştır.',
    warn:'Bandı hızlı bırakma, kontrollü geri getir.',
    aesthetic:"Face Pull'u destekler, omuz sakatlanmalarını önlemede etkili." },
  { id:'tibialis-raise', name:'Tibialis Raise', sets:3, reps:'15-20', rest:'45-60 sn', tier:'light', grip:'—', target:'Baldırın Ön Kısmı (Tibialis Anterior)', freq:'Haftada 2-3 kez',
    form:'Sırtını duvara yasla, ayak uçların yerden çıksın. Ayak uçlarını kendine doğru kaldır.',
    warn:'Diz/kalçayı bükerek yardım etme; hareket sadece bilekten gelmeli.',
    aesthetic:'Baldırın önünü doldurarak alt bacağa 360° dolgun görünüm kazandırır.' },
];

const ALL_BY_ID: Record<string, Exercise> = {};
Object.values(PROGRAM).flat().forEach(ex => { ALL_BY_ID[ex.id] = ex; });
BONUS.forEach(ex => { ALL_BY_ID[ex.id] = ex; });

const COOLDOWN = [
  { name:'Kalça Fleksör Gerdirme', hold:'30-45 sn / taraf', cue:'Bir dizin yerde, arka bacağın diz üstünde; kalçanı hafif öne it, ön bacağın kalça önünde gerilme hisset.' },
  { name:'Kalça / Glute Gerdirme (Figure-4)', hold:'30-45 sn / taraf', cue:'Sırtüstü uzan, bir ayak bileğini diğer dizin üstüne çapraz koy, boşta kalan bacağı göğsüne doğru çek.' },
  { name:'Göğüs / Ön Omuz Gerdirme', hold:'30-45 sn / taraf', cue:'Kapı kenarına veya duvara kolunu 90° dirsekten yasla, gövdeni yavaşça karşı yöne çevir.' },
];

/* ---------- HELPERS ---------- */
function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function todayStr(): string { return fmtDate(new Date()); }
function scheduledDay(): number { return WD_TO_DAY[new Date().getDay()] || 0; }
function formatShortDate(ds: string): string { return new Date(ds + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }); }
function formatLongDate(ds: string): string { return new Date(ds + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }); }
function formatMMSS(sec: number): string { const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); }
function parseRestSeconds(restStr: string): number | null {
  if (!restStr) return null;
  const lower = restStr.toLowerCase();
  if (lower.includes('serbest')) return null;
  const nums = restStr.match(/[\d.]+/g);
  if (!nums) return null;
  const max = Math.max(...nums.map(Number));
  return Math.round(lower.includes('dk') ? max * 60 : max);
}

/* ---------- TYPES ---------- */
interface WorklogEntry { dayNum: number; exercises: Record<string, any[]>; }
interface Meta { lastlogs: Record<string, any>; dates: string[]; }

/* ---------- SUPABASE IO ---------- */
async function getWorklog(ds: string): Promise<WorklogEntry | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select('value')
    .eq('key', 'worklog_' + ds)
    .maybeSingle();
  if (error || !data) return null;
  try { return JSON.parse(data.value); } catch { return null; }
}

async function loadMeta(): Promise<Meta> {
  const { data, error } = await supabase
    .from('workouts')
    .select('value')
    .eq('key', 'meta')
    .maybeSingle();
  if (error || !data) return { lastlogs: {}, dates: [] };
  try { return JSON.parse(data.value); } catch { return { lastlogs: {}, dates: [] }; }
}

async function saveWorklogRemote(ds: string, entry: WorklogEntry) {
  await supabase.from('workouts').upsert(
    { key: 'worklog_' + ds, value: JSON.stringify(entry), shared: false },
    { onConflict: 'key' }
  );
}

async function saveMetaRemote(meta: Meta) {
  await supabase.from('workouts').upsert(
    { key: 'meta', value: JSON.stringify(meta), shared: false },
    { onConflict: 'key' }
  );
}

/* ---------- ROOT APP ---------- */
export default function VTaperApp() {
  const [tab, setTab] = useState<'program' | 'calendar'>('program');
  const [dayNum, setDayNum] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [meta, setMeta] = useState<Meta>({ lastlogs: {}, dates: [] });
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarSelected, setCalendarSelected] = useState<string | null>(null);
  const [dayLog, setDayLog] = useState<Record<string, any[]>>({});
  const [saveFlash, setSaveFlash] = useState('');
  const [initDone, setInitDone] = useState(false);

  const timerIntervals = useRef<Record<string, number>>({});
  const flashTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const m = await loadMeta();
        setMeta(m);
        const existing = await getWorklog(todayStr());
        if (existing && existing.dayNum) {
          setDayNum(existing.dayNum);
          setDayLog(existing.exercises || {});
        }
      } catch (e) {
        console.error('Init error:', e);
      }
      setInitDone(true);
    })();
  }, []);

  async function saveDayLog(newLog: Record<string, any[]>) {
    if (dayNum === null) return;
    const payload: WorklogEntry = { dayNum, exercises: newLog };
    try {
      await saveWorklogRemote(todayStr(), payload);

      const updatedLastlogs = { ...meta.lastlogs };
      Object.entries(newLog).forEach(([exId, sets]) => {
        const valid = (sets || []).filter(s => s && s.weight && s.reps);
        if (valid.length) {
          const top = valid[valid.length - 1];
          updatedLastlogs[exId] = { weight: top.weight, reps: top.reps, date: todayStr() };
        }
      });
      const newDates = meta.dates.includes(todayStr()) ? meta.dates : [...meta.dates, todayStr()];
      const updatedMeta: Meta = { lastlogs: updatedLastlogs, dates: newDates };
      setMeta(updatedMeta);
      await saveMetaRemote(updatedMeta);
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  function flashSave(msg: string) {
    setSaveFlash(msg);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = window.setTimeout(() => setSaveFlash(''), 1500);
  }

  function startTimer(exId: string, seconds: number) {
    setTimers(prev => ({ ...prev, [exId]: seconds }));
    if (timerIntervals.current[exId]) clearInterval(timerIntervals.current[exId]);
    timerIntervals.current[exId] = window.setInterval(() => {
      setTimers(prev => {
        const next = { ...prev, [exId]: (prev[exId] || 0) - 1 };
        if (next[exId] <= 0) {
          clearInterval(timerIntervals.current[exId]);
          delete timerIntervals.current[exId];
        }
        return next;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      Object.values(timerIntervals.current).forEach(clearInterval);
    };
  }, []);

  if (!initDone) {
    return (
      <div className="min-h-screen bg-[#0c0d09] text-[#8a8676] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-[22px] mb-2">🏋️</div>
          <div className="text-sm">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d09] text-[#eae6d9] font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .font-oswald { font-family: 'Oswald', sans-serif; }
      `}</style>

      <div className="max-w-[480px] mx-auto px-4 pt-5 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-oswald font-bold text-[22px] text-white tracking-wide">V-Taper Takip</div>
            <div className="text-xs text-[#8a8676] mt-0.5">{tab === 'program' ? 'Antrenman programı — otomatik kayıt' : 'Geçmiş & ilerleme'}</div>
          </div>
          <span className="text-[22px]">🏋️</span>
        </div>

        {tab === 'program' ? (
          <ProgramTab
            dayNum={dayNum}
            setDayNum={setDayNum}
            dayLog={dayLog}
            meta={meta}
            showPicker={showPicker}
            setShowPicker={setShowPicker}
            timers={timers}
            startTimer={startTimer}
            saveDayLog={saveDayLog}
            setDayLog={setDayLog}
            saveFlash={saveFlash}
            flashSave={flashSave}
          />
        ) : (
          <CalendarTab
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            calendarSelected={calendarSelected}
            setCalendarSelected={setCalendarSelected}
            meta={meta}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#101109] border-t border-[#232418]">
        <div className="max-w-[480px] mx-auto grid grid-cols-2">
          <button onClick={() => setTab('program')} className={`flex flex-col items-center gap-0.5 py-2.5 bg-none border-none ${tab === 'program' ? 'text-[#d4fc4b]' : 'text-[#6b6858]'}`}>
            <span className="text-[19px]">🏋️</span><span className="text-[11px] font-semibold">Program</span>
          </button>
          <button onClick={() => setTab('calendar')} className={`flex flex-col items-center gap-0.5 py-2.5 bg-none border-none ${tab === 'calendar' ? 'text-[#d4fc4b]' : 'text-[#6b6858]'}`}>
            <span className="text-[19px]">📅</span><span className="text-[11px] font-semibold">Takvim</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- PROGRAM TAB ---------- */
interface ProgramTabProps {
  dayNum: number | null;
  setDayNum: (d: number | null) => void;
  dayLog: Record<string, any[]>;
  setDayLog: (l: Record<string, any[]>) => void;
  meta: Meta;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
  timers: Record<string, number>;
  startTimer: (exId: string, seconds: number) => void;
  saveDayLog: (l: Record<string, any[]>) => void;
  saveFlash: string;
  flashSave: (msg: string) => void;
}

function ProgramTab(props: ProgramTabProps) {
  const { dayNum, setDayNum, dayLog, setDayLog, meta, showPicker, setShowPicker, timers, startTimer, saveDayLog, saveFlash, flashSave } = props;

  if (!dayNum) {
    const scheduled = scheduledDay();
    return (
      <>
        <div className="text-[13px] text-[#8a8676] mb-3">Bugün hangi antrenmanı yapıyorsun?</div>
        <div className="flex flex-col gap-2">
          {DAY_ORDER.map(d => {
            const m = DAY_META[d];
            return (
              <button key={d} onClick={() => setDayNum(d)}
                className="w-full text-left p-4 rounded-xl bg-[#141510] border-[1.5px]"
                style={{ borderColor: m.color + '55' }}>
                <div className="font-oswald text-base font-bold" style={{ color: m.color }}>
                  {m.label}
                  {d === scheduled && <span className="text-[11px] text-[#5c5a4f] font-medium ml-2">· bugün programda bu var</span>}
                </div>
                <div className="text-xs text-[#8a8676] mt-0.5">{m.sub}</div>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const dmeta = DAY_META[dayNum];
  const exercises = PROGRAM[dayNum] || [];
  const extraIds = Object.keys(dayLog).filter(id => !exercises.some(e => e.id === id));
  const extraExercises = extraIds.map(id => ALL_BY_ID[id]).filter(Boolean);

  function addSet(exId: string) {
    const wInput = document.getElementById('w-' + exId) as HTMLInputElement | null;
    const rInput = document.getElementById('r-' + exId) as HTMLInputElement | null;
    const w = wInput?.value || '', r = rInput?.value || '';
    if (!w || !r) return;
    const newLog = { ...dayLog };
    if (!newLog[exId]) newLog[exId] = [];
    newLog[exId] = [...newLog[exId], { weight: w, reps: r }];
    setDayLog(newLog);
    saveDayLog(newLog);
    if (wInput) wInput.value = '';
    if (rInput) rInput.value = '';
    flashSave('✓ Kaydedildi — Takvime işlendi');
  }

  function removeSet(exId: string, idx: number) {
    const newLog = { ...dayLog };
    if (newLog[exId]) {
      newLog[exId] = newLog[exId].filter((_, i) => i !== idx);
      if (newLog[exId].length === 0) delete newLog[exId];
    }
    setDayLog(newLog);
    saveDayLog(newLog);
    flashSave('✓ Güncellendi');
  }

  function pickExtra(exId: string) {
    const newLog = { ...dayLog };
    if (!newLog[exId]) newLog[exId] = [];
    setDayLog(newLog);
    saveDayLog(newLog);
    setShowPicker(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-oswald font-semibold text-lg" style={{ color: dmeta.color }}>{dmeta.label}</div>
          <div className="text-xs text-[#8a8676]">{dmeta.sub}</div>
        </div>
        <button onClick={() => setDayNum(null)} className="text-[11px] text-[#6b6858] underline">Günü değiştir</button>
      </div>

      {saveFlash && (
        <div className="mb-3 px-3 py-1.5 rounded-lg text-xs bg-[rgba(212,252,75,0.08)] border border-[rgba(212,252,75,0.25)] text-[#d4fc4b]">
          {saveFlash}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {exercises.map(ex => (
          <ExerciseCard key={ex.id} ex={ex} sets={dayLog[ex.id] || []} last={meta.lastlogs[ex.id]}
            timers={timers} startTimer={startTimer} onAddSet={addSet} onRemoveSet={removeSet} isExtra={false} />
        ))}
      </div>

      {extraExercises.length > 0 && (
        <>
          <div className="text-[11px] text-[#a98bc9] font-semibold tracking-wider mt-4 mb-2">EKSTRA EKLENEN</div>
          <div className="flex flex-col gap-2.5">
            {extraExercises.map(ex => (
              <ExerciseCard key={ex.id} ex={ex} sets={dayLog[ex.id] || []} last={meta.lastlogs[ex.id]}
                timers={timers} startTimer={startTimer} onAddSet={addSet} onRemoveSet={removeSet} isExtra={true} />
            ))}
          </div>
        </>
      )}

      <button onClick={() => setShowPicker(true)}
        className="w-full mt-4 p-2.5 rounded-lg text-sm font-semibold bg-[#141510] border border-dashed border-[#3a3a2c] text-[#a98bc9]">
        + Ekstra Hareket Ekle
      </button>

      <div className="text-[11px] text-[#6a93b8] font-semibold tracking-wider mt-5 mb-2">ANTRENMAN SONRASI (2-3 DK)</div>
      {COOLDOWN.map((c, i) => (
        <div key={i} className="rounded-[10px] px-3 py-2.5 bg-[#141510] border border-[#232418] mb-2">
          <span className="text-[13px] font-bold text-white">{c.name}</span>
          <span className="text-[11px] text-[#6a93b8] font-semibold ml-1.5">{c.hold}</span>
          <div className="text-xs text-[#8a8676] mt-0.5 leading-snug">{c.cue}</div>
        </div>
      ))}

      {showPicker && <PickerSheet dayNum={dayNum} dayLog={dayLog} onPick={pickExtra} onClose={() => setShowPicker(false)} />}
    </>
  );
}

/* ---------- EXERCISE CARD ---------- */
interface ExerciseCardProps {
  ex: Exercise;
  sets: any[];
  last: any;
  timers: Record<string, number>;
  startTimer: (exId: string, seconds: number) => void;
  onAddSet: (exId: string) => void;
  onRemoveSet: (exId: string, idx: number) => void;
  isExtra: boolean;
}

function ExerciseCard({ ex, sets, last, timers, startTimer, onAddSet, onRemoveSet, isExtra }: ExerciseCardProps) {
  const tierColor = TIER_COLOR[ex.tier];
  const restSeconds = parseRestSeconds(ex.rest);
  const timerVal = timers[ex.id];

  let restNode;
  if (restSeconds === null) {
    restNode = <span>{ex.rest}</span>;
  } else if (timerVal === undefined) {
    restNode = (
      <button onClick={() => startTimer(ex.id, restSeconds)}
        className="bg-transparent border-none p-0 text-[11.5px] text-[#8a8676] underline underline-offset-2">
        {ex.rest} ⏱
      </button>
    );
  } else if (timerVal <= 0) {
    restNode = <span className="text-[11.5px] text-[#7fa878] font-bold">Hazır ✓</span>;
  } else {
    restNode = (
      <button onClick={() => startTimer(ex.id, restSeconds)}
        className="bg-transparent border-none p-0 text-[11.5px] text-[#d4fc4b] font-bold">
        {formatMMSS(timerVal)}
      </button>
    );
  }

  return (
    <div className={`rounded-xl p-3 bg-[#141510] border ${ex.optional ? 'border-dashed border-[#3a3830]' : 'border-[#232418]'}`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[14.5px] font-bold text-white">{ex.name}</span>
        {ex.home && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#8a8676] border border-[#2a2a1e]">🏠 Evde</span>}
        {ex.optional && <span className="text-[10px] px-1.5 py-0.5 rounded border border-dashed border-[#5c5a4f] text-[#8a8676]">Opsiyonel</span>}
        {isExtra && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(169,139,201,0.15)] text-[#a98bc9] border border-[rgba(169,139,201,0.4)]">Ekstra</span>}
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[11.5px] text-[#8a8676] mt-1">
        <span className="font-semibold" style={{ color: tierColor }}>{TIER_LABEL[ex.tier]}</span>
        <span>·</span>
        <span>Hedef: {ex.sets}×{ex.reps}</span>
        <span>·</span>
        {restNode}
        {ex.grip && ex.grip !== '—' && <><span>·</span><span>{ex.grip}</span></>}
      </div>

      <div className="text-[11.5px] text-[#6b6858] mt-0.5">{ex.target}</div>

      <div className="my-2.5 p-2.5 rounded-lg bg-[#0f1009] text-xs text-[#b3af9e] leading-relaxed space-y-1.5">
        <div><strong className="text-[#d8d4c4]">Uygulama:</strong> {ex.form}</div>
        <div className="text-[#e8a68d]"><strong className="text-[#e8a68d]">Uyarı:</strong> {ex.warn}</div>
        <div className="text-[#7fa878]"><strong className="text-[#7fa878]">Estetik:</strong> {ex.aesthetic}</div>
        {ex.personalNote && <div className="text-[#a98bc9] border-l-2 border-[#a98bc9] pl-2">{ex.personalNote}</div>}
      </div>

      {last && (
        <div className="text-[11.5px] text-[#a98bc9] mb-2">
          Son seferki: <strong>{last.weight} kg × {last.reps}</strong> ({formatShortDate(last.date)})
        </div>
      )}

      {sets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {sets.map((s, i) => (
            <span key={i} onClick={() => onRemoveSet(ex.id, i)}
              className="text-[11.5px] px-2 py-1 rounded bg-[#1a1b12] text-[#c9c5b6] border border-[#262719] cursor-pointer">
              {i + 1}: {s.weight}×{s.reps} <span className="text-[#5c5a4f]">✕</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="number" inputMode="decimal" placeholder="kg" id={'w-' + ex.id}
          className="flex-1 min-w-0 rounded-lg px-2.5 py-2 text-sm bg-[#1a1b12] border border-[#262719] text-[#eae6d9]" />
        <span className="text-[11px] text-[#5c5a4f]">×</span>
        <input type="number" inputMode="numeric" placeholder="tekrar" id={'r-' + ex.id}
          className="flex-1 min-w-0 rounded-lg px-2.5 py-2 text-sm bg-[#1a1b12] border border-[#262719] text-[#eae6d9]" />
        <button onClick={() => onAddSet(ex.id)}
          className="shrink-0 rounded-lg px-3.5 py-2 bg-[#d4fc4b] text-[#0c0d09] border-none text-lg font-bold leading-none">
          +
        </button>
      </div>
    </div>
  );
}

/* ---------- PICKER SHEET ---------- */
interface PickerProps {
  dayNum: number;
  dayLog: Record<string, any[]>;
  onPick: (exId: string) => void;
  onClose: () => void;
}

function PickerSheet({ dayNum, dayLog, onPick, onClose }: PickerProps) {
  const exercises = PROGRAM[dayNum] || [];
  const extraIds = Object.keys(dayLog).filter(id => !exercises.some(e => e.id === id));
  const excludeIds = [...exercises.map(e => e.id), ...extraIds];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[480px] max-h-[80vh] overflow-y-auto bg-[#101109] border border-[#232418] border-b-0 rounded-t-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#232418] sticky top-0 bg-[#101109]">
          <span className="font-oswald text-[15px] text-white">Hareket Seç</span>
          <button onClick={onClose} className="bg-transparent border-none text-[#8a8676] text-[22px] leading-none">×</button>
        </div>
        <div className="px-3 pt-2 pb-4">
          {DAY_ORDER.map(d => {
            const list = PROGRAM[d].filter(ex => !excludeIds.includes(ex.id));
            if (!list.length) return null;
            return (
              <div key={d} className="mt-2.5">
                <div className="text-[11px] font-bold mb-1" style={{ color: DAY_META[d].color }}>{DAY_META[d].label}</div>
                {list.map(ex => (
                  <button key={ex.id} onClick={() => onPick(ex.id)}
                    className="block w-full text-left px-3 py-2.5 rounded-lg bg-[#1a1b12] text-[#eae6d9] text-[13px] mb-1 border-none">
                    {ex.name}
                  </button>
                ))}
              </div>
            );
          })}
          {(() => {
            const bonusList = BONUS.filter(ex => !excludeIds.includes(ex.id));
            if (!bonusList.length) return null;
            return (
              <div className="mt-2.5">
                <div className="text-[11px] font-bold mb-1 text-[#a98bc9]">BONUS</div>
                {bonusList.map(ex => (
                  <button key={ex.id} onClick={() => onPick(ex.id)}
                    className="block w-full text-left px-3 py-2.5 rounded-lg bg-[#1a1b12] text-[#eae6d9] text-[13px] mb-1 border-none">
                    {ex.name}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ---------- CALENDAR TAB ---------- */
interface CalendarTabProps {
  calendarMonth: Date;
  setCalendarMonth: (d: Date) => void;
  calendarSelected: string | null;
  setCalendarSelected: (ds: string | null) => void;
  meta: Meta;
}

function CalendarTab({ calendarMonth, setCalendarMonth, calendarSelected, setCalendarSelected, meta }: CalendarTabProps) {
  const month = calendarMonth;
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= total; day++) cells.push(day);

  const [selectedEntry, setSelectedEntry] = useState<WorklogEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!calendarSelected) { setSelectedEntry(null); return; }
      try {
        const entry = await getWorklog(calendarSelected);
        if (!cancelled) setSelectedEntry(entry);
      } catch {
        if (!cancelled) setSelectedEntry(null);
      }
    })();
    return () => { cancelled = true; };
  }, [calendarSelected]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCalendarMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="bg-[#101109] border-none rounded-lg px-3 py-1.5 text-[#8a8676] text-base">‹</button>
        <div className="font-oswald text-[15px] font-semibold text-white">
          {MONTH_LABELS[month.getMonth()]} {month.getFullYear()}
        </div>
        <button onClick={() => setCalendarMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="bg-[#101109] border-none rounded-lg px-3 py-1.5 text-[#8a8676] text-base">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_LABELS.map(l => <div key={l} className="text-center text-[10px] text-[#5c5a4f] font-semibold">{l}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-5">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const d = new Date(month.getFullYear(), month.getMonth(), day);
          const ds = fmtDate(d);
          const logged = meta.dates.includes(ds);
          const isToday = ds === todayStr();
          const isSelected = calendarSelected === ds;
          return (
            <button key={i} onClick={() => setCalendarSelected(ds)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg bg-[#141510] ${
                isSelected ? 'border-[1.5px] border-[#d4fc4b] bg-[#1f2114]' : isToday ? 'border border-[#4a4a38]' : 'border border-[#1c1d14]'
              }`}>
              <span className={`text-xs ${isToday ? 'text-[#d4fc4b] font-bold' : 'text-[#c9c5b6] font-medium'}`}>{day}</span>
              {logged && <span className="w-1 h-1 rounded-full mt-0.5 bg-[#d4fc4b]" />}
            </button>
          );
        })}
      </div>

      {calendarSelected && (
        <div className="rounded-xl p-3.5 bg-[#141510] border border-[#232418]">
          <div className="font-oswald text-sm text-white mb-2">{formatLongDate(calendarSelected)}</div>
          {selectedEntry ? (
            <>
              {DAY_META[selectedEntry.dayNum] && (
                <div className="text-xs font-semibold mb-1.5" style={{ color: DAY_META[selectedEntry.dayNum].color }}>
                  {DAY_META[selectedEntry.dayNum].label}
                </div>
              )}
              {Object.entries(selectedEntry.exercises || {}).map(([exId, sets]) => {
                const valid = (sets || []).filter((s: any) => s && s.weight && s.reps);
                if (!valid.length) return null;
                const ex = ALL_BY_ID[exId];
                return (
                  <div key={exId} className="flex items-center justify-between text-[12.5px] mb-1.5">
                    <span className="text-[#c9c5b6]">{ex ? ex.name : exId}</span>
                    <span className="text-[#d4fc4b] font-semibold">
                      {valid.map((s: any) => `${s.weight}×${s.reps}`).join(', ')}
                    </span>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-xs text-[#5c5a4f]">Bu gün için kayıt yok.</div>
          )}
        </div>
      )}
    </>
  );
}