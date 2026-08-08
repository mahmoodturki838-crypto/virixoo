# VIRIXOO — PROJECT HANDOFF

## الهدف
بناء موقع Virixoo متخصص في محتوى العناية بالكلاب والقطط باللغة الإنجليزية، قابل للتوسع تدريجيًا إلى حوالي 5,000 مقالة، مع:
- مقالات احترافية ومفيدة.
- SEO قوي وطبيعي.
- كلمات مفتاحية رئيسية وثانوية لكل موضوع.
- صور مناسبة لكل مقالة.
- روابط داخلية بين المقالات.
- صفحات Cats وDogs.
- Sitemap وRobots.txt.
- نشر Static عبر Netlify.

## الوضع الحالي
الموقع:
https://virixoo.com/

المستودع يستخدم JavaScript لبناء الموقع من بيانات المقالات.

## الملفات المهمة
- `src/build.js`
- `src/data/articles.json`
- `public/css/style.css`
- `public/`
- `dist/` يتم توليده أثناء الـ build.

## ما تم إنجازه
1. تم اكتشاف أن مسار CSS الصحيح هو:
   `public/css/style.css`
2. تم تصحيح وضع `style.css` ليكون في المسار الصحيح.
3. تم فحص `src/build.js`.
4. تم اكتشاف أن النسخة القديمة من `build.js` كانت تحتوي على أخطاء JavaScript/HTML واضحة.
5. تم تجهيز نسخة جديدة ومصححة من `src/build.js`.
6. النسخة الجديدة تحتوي على:
   - توليد الصفحة الرئيسية.
   - توليد صفحات المقالات.
   - صفحات Dogs وCats.
   - صفحات About / Privacy Policy / Contact.
   - نسخ ملفات `public` إلى `dist`.
   - إنشاء `robots.txt`.
   - إنشاء `sitemap.xml`.
   - ربط `/css/style.css`.
   - دعم صور المقالات.
7. لم يتم تعديل Netlify حتى الآن، وهذا مقصود.
8. `articles.json` ما زال يحتوي على بيانات تجريبية فقط، وليس مقالات حقيقية.

## articles.json الحالي
يحتوي حاليًا على مقالة تجريبية بالشكل العام:

```json
{
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-title",
      "image": "https://...",
      "summary": "Article summary...",
      "content": "Article content...",
      "category": "Dogs",
      "author": "Virixoo Editorial Team",
      "datePublished": "2026-08-08",
      "dateModified": "2026-08-08"
    }
  ]
}
```

هذه ليست مقالة حقيقية، والصورة ليست رابط صورة حقيقي.

## أهم ملاحظة تقنية
`build.js` الحالي ليس مولّد مقالات بالذكاء الاصطناعي.

وظيفته الحالية:
`articles.json → build.js → HTML → dist`

أي أنه يأخذ بيانات المقالات الموجودة ويحوّلها إلى صفحات.

## الخطة القادمة
لن ننتج 5,000 مقالة دفعة واحدة.

سنختبر أولًا دورة كاملة بمقالة حقيقية واحدة:

مقالة إنجليزية
→ صورة
→ SEO
→ articles.json
→ build.js
→ HTML
→ الموقع
→ فحص الصورة والمحتوى
→ فحص الروابط وSitemap

بعد نجاح الاختبار ننتقل إلى نظام أكبر لإدارة:
- Cats
- Dogs
- Training
- Nutrition
- Grooming
- Behavior
- Breeds
- Kitten/Puppy Care
وغيرها.

## استراتيجية المقالات
كل مقالة مستقبلًا يجب أن تحتوي على:
- عنوان فريد.
- Slug.
- Primary keyword.
- Secondary/semantic keywords.
- Search intent.
- Summary/meta description.
- محتوى إنجليزي طبيعي ومفيد.
- H1/H2/H3.
- صورة مناسبة.
- Alt text.
- Internal links.
- تاريخ النشر والتعديل.
- Structured data المناسب عند الحاجة.

## استراتيجية الصور
نريد في النهاية تخزين الصور محليًا داخل الموقع، مثل:

`public/images/cats/`
`public/images/dogs/`

ثم يستخدم المقال مسارًا مثل:

`/images/cats/example.webp`

بدل الاعتماد على روابط صور خارجية غير موثوقة.

## Netlify
لم يتم إجراء أي تعديل عليه حتى الآن.

لا نلمس Netlify قبل التأكد من:
1. `build.js`
2. `articles.json`
3. CSS
4. الصور
5. نجاح الـ build
6. ظهور المقالة فعليًا.

## الخطوة الحالية
تم تعديل `src/build.js` بالنسخة المصححة.

المطلوب الآن:
- Commit changes في GitHub.
- لا تعدّل `articles.json`.
- لا تعدّل Netlify.
- بعد التأكد من الـ Commit ننتقل للخطوة التالية.

## مبدأ العمل
لا ننتقل إلى مرحلة جديدة قبل اختبار المرحلة السابقة.

الهدف النهائي:
Virixoo = موقع محتوى احترافي باللغة الإنجليزية عن Cats & Dogs، قابل للنمو إلى آلاف المقالات بدون إعادة بناء النظام.