import { createContext, useContext, useState, type ReactNode } from 'react';

type Lang = 'en' | 'hi';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.courses': { en: 'Courses', hi: 'कोर्सेज़' },
  'nav.verify': { en: 'Verification', hi: 'सत्यापन' },
  'nav.partner': { en: 'Partner (AAC)', hi: 'पार्टनर (AAC)' },
  'nav.about': { en: 'About', hi: 'हमारे बारे में' },
  'nav.login': { en: 'Login', hi: 'लॉगिन' },
  'nav.getCertified': { en: 'Get Certified', hi: 'प्रमाणपत्र पाएं' },

  // Hero
  'hero.badge': { en: 'Government Recognized · ISO 9001:2015', hi: 'सरकार मान्यता प्राप्त · ISO 9001:2015' },
  'hero.title1': { en: 'Future-Proof Your Career.', hi: 'अपने करियर को भविष्य के लिए तैयार करें।' },
  'hero.title2': { en: 'Get Certified.', hi: 'प्रमाणित हों।' },
  'hero.sub': { en: 'CETCF offers 225+ Next-Gen vocational certifications across 23 sectors. Master new skills, conquer the online exam, and unlock global opportunities.', hi: 'CETCF 23 क्षेत्रों में 225+ अगली पीढ़ी के व्यावसायिक प्रमाणपत्र प्रदान करता है। नए कौशल सीखें, ऑनलाइन परीक्षा दें और वैश्विक अवसरों का लाभ उठाएं।' },
  'hero.browseCourses': { en: 'Browse 225+ Courses', hi: '225+ कोर्सेज़ देखें' },
  'hero.verifyCert': { en: 'Verify Certificate', hi: 'प्रमाणपत्र सत्यापित करें' },
  'hero.stat.courses': { en: 'Courses', hi: 'कोर्सेज़' },
  'hero.stat.sectors': { en: 'Sectors', hi: 'क्षेत्र' },
  'hero.stat.online': { en: 'Online', hi: 'ऑनलाइन' },
  'hero.stat.start': { en: 'Start', hi: 'शुरुआत' },

  // Trust Bar
  'trust.section8': { en: 'Section 8 Company', hi: 'धारा 8 कंपनी' },
  'trust.iso': { en: 'ISO 9001:2015 Certified', hi: 'ISO 9001:2015 प्रमाणित' },
  'trust.govt': { en: 'Govt. Recognized', hi: 'सरकार मान्यता प्राप्त' },
  'trust.panIndia': { en: 'Pan-India Reach', hi: 'पूरे भारत में' },
  'trust.rpl': { en: 'RPL + Training', hi: 'RPL + प्रशिक्षण' },

  // Pathways
  'path.eyebrow': { en: 'Dual Pathways', hi: 'दो रास्ते' },
  'path.title1': { en: 'Two Ways to', hi: 'इसे पाने के' },
  'path.title2': { en: 'Achieve It', hi: 'दो तरीके' },
  'path.learn.title': { en: 'Learn & Get Certified', hi: 'सीखें और प्रमाणपत्र पाएं' },
  'path.learn.desc': { en: 'Purchase our digital course, master the content at your own pace, and ace the online MCQ exam.', hi: 'हमारा डिजिटल कोर्स खरीदें, अपनी गति से सीखें, और ऑनलाइन MCQ परीक्षा पास करें।' },
  'path.learn.btn': { en: 'Start Learning →', hi: 'सीखना शुरू करें →' },
  'path.rpl.title': { en: 'Already Skilled? (RPL)', hi: 'पहले से कुशल हैं? (RPL)' },
  'path.rpl.desc': { en: 'Skip the training. Verify your existing skills directly through our online assessment and claim your certificate.', hi: 'प्रशिक्षण छोड़ें। हमारे ऑनलाइन मूल्यांकन से अपने कौशल की पुष्टि करें और प्रमाणपत्र प्राप्त करें।' },
  'path.rpl.btn': { en: 'Take Exam Directly →', hi: 'सीधे परीक्षा दें →' },

  // Sectors
  'sectors.eyebrow': { en: 'Explore Sectors', hi: 'क्षेत्र देखें' },
  'sectors.title1': { en: '23 Sectors,', hi: '23 क्षेत्र,' },
  'sectors.title2': { en: '225+ Paths', hi: '225+ रास्ते' },
  'sectors.viewAll': { en: 'View All Sectors →', hi: 'सभी क्षेत्र देखें →' },
  'sectors.courses': { en: 'Courses', hi: 'कोर्सेज़' },

  // CTA
  'cta.title1': { en: 'Initiate Your', hi: 'अपना' },
  'cta.title2': { en: 'Next Upgrade', hi: 'अगला कदम उठाएं' },
  'cta.sub': { en: "Join the network of certified professionals shaping the future of India's workforce.", hi: 'भारत के कार्यबल का भविष्य बनाने वाले प्रमाणित पेशेवरों के नेटवर्क से जुड़ें।' },
  'cta.explore': { en: 'Explore Courses', hi: 'कोर्सेज़ देखें' },
  'cta.partner': { en: 'Become a Partner', hi: 'पार्टनर बनें' },

  // Map
  'map.infoCard.address': { en: 'Address', hi: 'पता' },

  // About Page
  'about.title1': { en: 'Who', hi: 'हम' },
  'about.title2': { en: 'We Are', hi: 'कौन हैं' },
  'about.subtitle': { en: 'Empowering India through vocational education and certification since 2015.', hi: '2015 से व्यावसायिक शिक्षा और प्रमाणन के माध्यम से भारत को सशक्त बनाना।' },
  'about.mission.title': { en: 'Our Mission', hi: 'हमारा मिशन' },
  'about.mission.desc': { en: 'To provide accessible, high-quality vocational education and skill certification that empowers individuals to build sustainable careers and contributes to the economic growth of the nation.', hi: 'सुलभ, उच्च गुणवत्ता वाली व्यावसायिक शिक्षा और कौशल प्रमाणन प्रदान करना जो व्यक्तियों को स्थायी करियर बनाने के लिए सशक्त बनाता है और राष्ट्र के आर्थिक विकास में योगदान देता है।' },
  'about.vision.title': { en: 'Our Vision', hi: 'हमारा दृष्टिकोण' },
  'about.vision.desc': { en: 'To be the most trusted and recognized certification body in India, bridging the gap between industry requirements and workforce skills through innovative learning pathways.', hi: 'अभिनव शिक्षण मार्गों के माध्यम से उद्योग की आवश्यकताओं और कार्यबल कौशल के बीच की खाई को पाटते हुए, भारत में सबसे विश्वसनीय और मान्यता प्राप्त प्रमाणन निकाय बनना।' },
  'about.story.eyebrow': { en: 'Our Story', hi: 'हमारी कहानी' },
  'about.story.title': { en: 'Empowering the Workforce of Tomorrow', hi: 'कल के कार्यबल को सशक्त बनाना' },
  'about.story.p1': { en: 'The Council for Education, Training & Certification Foundation (CETCF) is an ISO 9001:2015 certified, Section 8 non-profit organization registered under the Government of India.', hi: 'शिक्षा, प्रशिक्षण और प्रमाणन फाउंडेशन परिषद (CETCF) एक ISO 9001:2015 प्रमाणित, धारा 8 गैर-लाभकारी संगठन है जो भारत सरकार के तहत पंजीकृत है।' },
  'about.story.p2': { en: 'Our foundation is built on the belief that formal recognition of skills can transform lives. For years, millions of skilled workers across India have operated in the unorganized sector without formal certification. We bridge this gap through our comprehensive Recognition of Prior Learning (RPL) pathways and structured digital training programs.', hi: 'हमारी नींव इस विश्वास पर बनी है कि कौशल की औपचारिक मान्यता जीवन को बदल सकती है। वर्षों से, भारत भर में लाखों कुशल कर्मचारी बिना औपचारिक प्रमाणन के असंगठित क्षेत्र में काम कर रहे हैं। हम अपने व्यापक पूर्व शिक्षा की मान्यता (RPL) मार्गों और संरचित डिजिटल प्रशिक्षण कार्यक्रमों के माध्यम से इस अंतर को पाटते हैं।' },
  'about.story.list.1': { en: 'Government Registered Entity', hi: 'सरकार पंजीकृत संस्था' },
  'about.story.list.2': { en: 'Pan-India Operations', hi: 'पूरे भारत में संचालन' },
  'about.story.list.3': { en: 'ISO 9001:2015 Quality Standards', hi: 'ISO 9001:2015 गुणवत्ता मानक' },
  'about.story.list.4': { en: 'Industry-Aligned Curriculum', hi: 'उद्योग-संरेखित पाठ्यक्रम' },
  'about.values.eyebrow': { en: 'Our Values', hi: 'हमारे मूल्य' },
  'about.values.title': { en: 'Why Trust CETCF?', hi: 'CETCF पर भरोसा क्यों करें?' },
  'about.values.1.title': { en: 'Authenticity', hi: 'प्रामाणिकता' },
  'about.values.1.desc': { en: 'Every certificate is QR-verifiable instantly on our portal.', hi: 'हर प्रमाणपत्र हमारे पोर्टल पर तुरंत QR-सत्यापन योग्य है।' },
  'about.values.2.title': { en: 'Quality Assurance', hi: 'गुणवत्ता आश्वासन' },
  'about.values.2.desc': { en: 'Syllabus designed by industry experts matching global standards.', hi: 'वैश्विक मानकों से मेल खाने वाले उद्योग विशेषज्ञों द्वारा डिजाइन किया गया पाठ्यक्रम।' },
  'about.values.3.title': { en: 'Accessibility', hi: 'पहुंच' },
  'about.values.3.desc': { en: 'Complete the entire certification process 100% online from anywhere.', hi: 'पूरी प्रमाणन प्रक्रिया कहीं से भी 100% ऑनलाइन पूरी करें।' },
  'about.values.4.title': { en: 'Inclusivity', hi: 'समावेशिता' },
  'about.values.4.desc': { en: 'Courses tailored for school dropouts to experienced professionals.', hi: 'स्कूल छोड़ने वालों से लेकर अनुभवी पेशेवरों तक के लिए तैयार किए गए कोर्सेज़।' },
  'about.presence.eyebrow': { en: 'Pan-India Presence', hi: 'पूरे भारत में उपस्थिति' },
  'about.presence.title': { en: 'Empowering Skills Across The Nation', hi: 'पूरे देश में कौशल को सशक्त बनाना' },
  'about.presence.desc': { en: 'With training centers and affiliated institutes spread across multiple states, we ensure that quality skill education reaches every corner of India.', hi: 'कई राज्यों में फैले प्रशिक्षण केंद्रों और संबद्ध संस्थानों के साथ, हम सुनिश्चित करते हैं कि गुणवत्तापूर्ण कौशल शिक्षा भारत के हर कोने तक पहुंचे।' },
  'about.partners.eyebrow': { en: 'Affiliations & Partners', hi: 'संबद्धता और भागीदार' },
  'about.partners.title': { en: 'Recognized By The Best', hi: 'सर्वश्रेष्ठ द्वारा मान्यता प्राप्त' },
  'about.cta.title': { en: 'Ready to shape your future?', hi: 'क्या आप अपने भविष्य को आकार देने के लिए तैयार हैं?' },
  'about.cta.desc': { en: 'Join thousands of certified professionals and unlock new career opportunities with a government-recognized certificate.', hi: 'हजारों प्रमाणित पेशेवरों से जुड़ें और सरकार द्वारा मान्यता प्राप्त प्रमाणपत्र के साथ करियर के नए अवसर खोलें।' },
  'about.cta.btn': { en: 'Explore Our Courses', hi: 'हमारे कोर्सेज़ देखें' },
  
  // Footer
  'footer.desc': { en: 'Council for Education, Training & Certification Foundation — empowering India\'s workforce through accessible vocational certification.', hi: 'शिक्षा, प्रशिक्षण और प्रमाणन फाउंडेशन परिषद — सुलभ व्यावसायिक प्रमाणन के माध्यम से भारत के कार्यबल को सशक्त बनाना।' },
  'footer.quickLinks': { en: 'Quick Links', hi: 'त्वरित लिंक' },
  'footer.programs': { en: 'Programs', hi: 'कार्यक्रम' },
  'footer.contact': { en: 'Contact', hi: 'संपर्क' },
  'footer.allCourses': { en: 'All Courses', hi: 'सभी कोर्सेज़' },
  'footer.verifyCert': { en: 'Verify Certificate', hi: 'प्रमाणपत्र सत्यापित करें' },
  'footer.aboutUs': { en: 'About Us', hi: 'हमारे बारे में' },
  'footer.contactUs': { en: 'Contact Us', hi: 'संपर्क करें' },
  'footer.vocational': { en: 'Vocational Training', hi: 'व्यावसायिक प्रशिक्षण' },
  'footer.rplCert': { en: 'RPL Certification', hi: 'RPL प्रमाणन' },
  'footer.onlineExam': { en: 'Online Examination', hi: 'ऑनलाइन परीक्षा' },
  'footer.partnerAAC': { en: 'Partner as AAC', hi: 'AAC पार्टनर बनें' },
  'footer.sendEnquiry': { en: 'Send Enquiry', hi: 'पूछताछ भेजें' },
  'footer.rights': { en: 'All rights reserved.', hi: 'सभी अधिकार सुरक्षित।' },
  'footer.privacy': { en: 'Privacy', hi: 'गोपनीयता' },
  'footer.terms': { en: 'Terms', hi: 'नियम' },
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = () => setLang(prev => prev === 'en' ? 'hi' : 'en');
  
  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
