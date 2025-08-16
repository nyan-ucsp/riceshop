const emailTemplates = {
    otp: {
        subject: 'Your Rice Shop OTP',
        text: (code) => `Your OTP is: ${code}`,
        html: (code) => `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
                <h2 style="color: #2d7a2d;">Rice Shop OTP</h2>
                <p>Dear Customer,</p>
                <p>Your One-Time Password (OTP) is:</p>
                <div style="font-size: 2em; font-weight: bold; letter-spacing: 6px; color: #2d7a2d; margin: 16px 0;">${code}</div>
                <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
            </div>
        `
    },
    otpResent: {
        subject: 'Your Rice Shop OTP (Resent)',
        text: (code) => `Your new OTP is: ${code}`,
        html: (code) => `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
                <h2 style="color: #2d7a2d;">Rice Shop OTP (Resent)</h2>
                <p>Dear Customer,</p>
                <p>Your new One-Time Password (OTP) is:</p>
                <div style="font-size: 2em; font-weight: bold; letter-spacing: 6px; color: #2d7a2d; margin: 16px 0;">${code}</div>
                <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
            </div>
        `
    },
    orderConfirmation: {
        subject: 'Order Confirmed',
        text: (orderName) => `Thank you ${orderName}, your rice order is confirmed!`,
        html: (orderName, orderNumber, totalPrice, orderDetailsHtml) => `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #f6fff6;">
                <h2 style="color: #2d7a2d;">Order Confirmed!</h2>
                <p>Thank you <b>${orderName}</b>, your rice order is confirmed!</p>
                <div style="margin: 20px 0;">
                    <b>Order Number:</b> ${orderNumber}<br/>
                    <b>Total Amount:</b> ${totalPrice}
                </div>
                <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">Product</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">Qty</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetailsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">Total:</td>
                            <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">${totalPrice}</td>
                        </tr>
                    </tfoot>
                </table>
                <p>We appreciate your business. You will receive another email when your order is delivered.</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
            </div>
        `
    },
    deliveryNotification: {
        subject: 'Your Order Has Been Delivered!',
        text: (orderName, orderNumber) => `Dear ${orderName}, your order ${orderNumber} has been successfully delivered!`,
        html: (orderName, orderNumber, orderDetailsHtml) => `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #f0fff4;">
                <h2 style="color: #2d7a2d;">Order Delivered!</h2>
                <p>Dear <b>${orderName}</b>,</p>
                <p>Great news! Your order has been successfully delivered to your address.</p>
                <div style="margin: 20px 0;">
                    <b>Order Number:</b> ${orderNumber}<br/>
                    <b>Delivery Date:</b> ${new Date().toLocaleDateString()}
                </div>
                <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">Product</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">Qty</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetailsHtml}
                    </tbody>
                </table>
                <p>Thank you for choosing Rice Shop! We hope you enjoy your rice.</p>
                <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
                <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
            </div>
        `
    },
    adminNotification: {
        subject: 'New Rice Order Received',
        text: (customerName, customerEmail, address, details, total) => 
            `New order from ${customerName} (${customerEmail})\nAddress: ${address}\n\nOrder details:\n${details}\nTotal: ${total}`,
        html: (customerName, customerEmail, address, detailsHtml, total) => `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 32px; background: #fffef8;">
                <h2 style="color: #2d7a2d; margin-bottom: 18px;">New Rice Order Received</h2>
                <div style="margin-bottom: 18px;">
                    <b>Customer:</b> ${customerName} (<a href="mailto:${customerEmail}">${customerEmail}</a>)<br/>
                    <b>Address:</b> ${address}
                </div>
                <table style="width:100%; border-collapse:collapse; margin-bottom: 18px;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">Product</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">Qty</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detailsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">Total:</td>
                            <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">${total}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="color:#888; font-size:0.95em;">Order placed via Rice Shop</div>
            </div>
        `
    }
};

module.exports = emailTemplates;
