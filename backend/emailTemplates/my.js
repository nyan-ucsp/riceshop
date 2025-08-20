const emailTemplates = {
    otp: {
        subject: 'သင့် Nan Ayeyar OTP',
        text: (code) => `သင့် OTP မှာ: ${code}`,
        html: (code) => `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
                <h2 style="color: #2d7a2d;">Nan Ayeyar OTP</h2>
                <p>အမြတ်တနိုးရှိသော ဝယ်ယူသူ၊</p>
                <p>သင့်တစ်ကြိမ်သုံး စကားဝှက် (OTP) မှာ:</p>
                <div style="font-size: 2em; font-weight: bold; letter-spacing: 6px; color: #2d7a2d; margin: 16px 0;">${code}</div>
                <p>ဤကုဒ်သည် မိနစ် ၁၀ အတွင်း မှန်ကန်သည်။ ကျေးဇူးပြု၍ မည်သူနှင့်မျှ မမျှဝေပါနှင့်။</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Nan Ayeyar အဖွဲ့</p>
            </div>
        `
    },
    otpResent: {
        subject: 'သင့် Nan Ayeyar OTP (ပြန်ပို့ထားသည်)',
        text: (code) => `သင့် OTP အသစ်မှာ: ${code}`,
        html: (code) => `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
                <h2 style="color: #2d7a2d;">Nan Ayeyar OTP (ပြန်ပို့ထားသည်)</h2>
                <p>အမြတ်တနိုးရှိသော ဝယ်ယူသူ၊</p>
                <p>သင့်တစ်ကြိမ်သုံး စကားဝှက် (OTP) အသစ်မှာ:</p>
                <div style="font-size: 2em; font-weight: bold; letter-spacing: 6px; color: #2d7a2d; margin: 16px 0;">${code}</div>
                <p>ဤကုဒ်သည် မိနစ် ၁၀ အတွင်း မှန်ကန်သည်။ ကျေးဇူးပြု၍ မည်သူနှင့်မျှ မမျှဝေပါနှင့်။</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Nan Ayeyar အဖွဲ့</p>
            </div>
        `
    },
    orderConfirmation: {
        subject: 'အော်ဒါ အတည်ပြုပြီး',
        text: (orderName) => `ကျေးဇူးတင်ပါတယ် ${orderName}၊ သင့်ဆန်အော်ဒါကို အတည်ပြုပြီးပါပြီ!`,
        html: (orderName, orderNumber, totalPrice, orderDetailsHtml) => `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #f6fff6;">
                <h2 style="color: #2d7a2d;">အော်ဒါ အတည်ပြုပြီး!</h2>
                <p>ကျေးဇူးတင်ပါတယ် <b>${orderName}</b>၊ သင့်ဆန်အော်ဒါကို အတည်ပြုပြီးပါပြီ!</p>
                <div style="margin: 20px 0;">
                    <b>အော်ဒါနံပါတ်:</b> ${orderNumber}<br/>
                    <b>စုစုပေါင်းငွေ:</b> ${totalPrice}
                </div>
                <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">ထုတ်ကုန်</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">အရေအတွက်</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">အကြမ်းစုစုပေါင်း</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetailsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">စုစုပေါင်း:</td>
                            <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">${totalPrice}</td>
                        </tr>
                    </tfoot>
                </table>
                <p>သင့်စီးပွားရေးကို ကျေးဇူးတင်ပါတယ်။ သင့်အော်ဒါကို ပို့ဆောင်ပြီးသောအခါ အီးမေးလ်တစ်စောင် ထပ်ရရှိပါမည်။</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Nan Ayeyar အဖွဲ့</p>
            </div>
        `
    },
    deliveryNotification: {
        subject: 'သင့်အော်ဒါကို ပို့ဆောင်ပြီးပါပြီ!',
        text: (orderName, orderNumber) => `အမြတ်တနိုးရှိသော ${orderName}၊ သင့်အော်ဒါ ${orderNumber} ကို အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ!`,
        html: (orderName, orderNumber, orderDetailsHtml) => `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #f0fff4;">
                <h2 style="color: #2d7a2d;">အော်ဒါ ပို့ဆောင်ပြီး!</h2>
                <p>အမြတ်တနိုးရှိသော <b>${orderName}</b>၊</p>
                <p>သတင်းကောင်းပါ! သင့်အော်ဒါကို သင့်လိပ်စာသို့ အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ။</p>
                <div style="margin: 20px 0;">
                    <b>အော်ဒါနံပါတ်:</b> ${orderNumber}<br/>
                    <b>ပို့ဆောင်သည့်ရက်စွဲ:</b> ${new Date().toLocaleDateString()}
                </div>
                <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">ထုတ်ကုန်</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">အရေအတွက်</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">အကြမ်းစုစုပေါင်း</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetailsHtml}
                    </tbody>
                </table>
                <p>Nan Ayeyar ရွေးချယ်ပေးတဲ့အတွက် ကျေးဇူးတင်ပါတယ်! သင့်ဆန်ကို နှစ်သက်မယ်လို့ မျှော်လင့်ပါတယ်။</p>
                <p>မေးခွန်းများ သို့မဟုတ် စိုးရိမ်မှုများ ရှိပါက ကျွန်ုပ်တို့ကို ဆက်သွယ်ရန် မတွန့်ဆုတ်ပါနှင့်။</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Nan Ayeyar အဖွဲ့</p>
            </div>
        `
    },
    adminNotification: {
        subject: 'ဆန်အော်ဒါအသစ် ရရှိပါသည်',
        text: (customerName, customerEmail, address, details, total) => 
            `${customerName} (${customerEmail}) ထံမှ အော်ဒါအသစ်\nလိပ်စာ: ${address}\n\nအော်ဒါအသေးစိတ်:\n${details}\nစုစုပေါင်း: ${total}`,
        html: (customerName, customerEmail, address, detailsHtml, total) => `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 32px; background: #fffef8;">
                <h2 style="color: #2d7a2d; margin-bottom: 18px;">ဆန်အော်ဒါအသစ် ရရှိပါသည်</h2>
                <div style="margin-bottom: 18px;">
                    <b>ဝယ်ယူသူ:</b> ${customerName} (<a href="mailto:${customerEmail}">${customerEmail}</a>)<br/>
                    <b>လိပ်စာ:</b> ${address}
                </div>
                <table style="width:100%; border-collapse:collapse; margin-bottom: 18px;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">ထုတ်ကုန်</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">အရေအတွက်</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">အကြမ်းစုစုပေါင်း</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detailsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">စုစုပေါင်း:</td>
                            <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">${total}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="color:#888; font-size:0.95em;">Nan Ayeyar မှ အော်ဒါတင်ထားပါသည်</div>
            </div>
        `
    }
};

module.exports = emailTemplates;
