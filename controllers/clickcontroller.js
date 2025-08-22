

import Click from '../models/click.js';
import Affiliate from '../models/affiliateModel.js';
// import Campaign from '../model/campaign.js';
import Compaign from "../models/compaignModel.js";
import { v4 as uuidv4 } from 'uuid';

export const trackClick = async (req, res) => {
  let { campaign_id, pub_id,originalClick } = req.query;

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'];


  if (campaign_id !== undefined) {
  campaign_id = Number(campaign_id);
  if (isNaN(campaign_id)) {
    return res.status(400).json({ success: false, message: "Invalid compId" });
  }
}

  if (pub_id !== undefined) {
       pub_id = Number(pub_id);
  if (isNaN(pub_id)) {
    return res.status(400).json({ success: false, message: "Invalid pub_id" });
  }
}

  try {
    const existing = await Click.findOne({ campaignId: campaign_id, pubId: pub_id, ip });
    const isUnique = !existing;

    const click = await Click.create({
      campaignId: campaign_id,
      pubId: pub_id,
      clickId: uuidv4(),
      ip,
      userAgent,
      referrer,
      isUnique,
      originalClick:originalClick
    });

    // Find campaign and increment click count
    const campaign = await Compaign.findOneAndUpdate(
      { compId: campaign_id },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    // const campaign = await Compaign.findOne({ compId: campaign_id })

    if (!campaign) return res.status(404).send('INVALID_OFFER_ID');

    const publiser = await Affiliate.findOne({pubId:pub_id});

    if(!publiser.pubId) {
      return res.status(404).send('INVALID_PUBLISER_ID');
    }

    // Set cookies
    res.cookie('campaignId', campaign_id, {
      maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false, secure: true, sameSite: 'None'
    });
    res.cookie('pubId', pub_id, {
      maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false, secure: true, sameSite: 'None'
    });
    res.cookie('clickId', click.clickId, {
      maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false, secure: true, sameSite: 'None'
    });

    // Redirect


    /*
    const redirectUri = new URL(campaign.trakingUrl);
    // redirectUri.searchParams.set('click_id', click._id);
    // redirectUri.searchParams.set('campaign_id', campaign_id);
    // redirectUri.searchParams.set('pub_id', pub_id);

    res.redirect(`${redirectUri.toString()}?cid=${click.clickId}&campaignId=${campaign_id}&pubId=${pub_id}`);


    console.log((`${redirectUri.toString()}?cid=${click.clickId}&campaignId=${campaign_id}&pubId=${pub_id}`))

    */




const redirectUri1 = campaign?.trakingUrl?.replace('{click_id}', click.clickId)  

const redirectUri = new URL(redirectUri1);

// Build your extra params
const extraParams = `cid=${click.clickId}&campaignId=${campaign_id}&pubId=${pub_id}`;

// Check if ? already exists in the base URL
let finalUrl;
if (redirectUri.search) {
  // URL already has ?
  finalUrl = `${redirectUri.toString()}&${extraParams}`;
} else {
  // No query yet
  finalUrl = `${redirectUri.toString()}?${extraParams}`;
}

// Redirect to final URL
res.redirect(finalUrl);



  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ message: 'Click tracking failed', error });
  }
};




// import Click from '../models/click.js';
// import Compaign from '../models/compaignModel.js';
// import { v4 as uuidv4 } from 'uuid';

// export const trackClick = async (req, res) => {
//   const { campaign_id, pub_id, p1, source } = req.query;

//   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//   const userAgent = req.headers['user-agent'];
//   const referrer = req.headers['referer'];

//   try {
//     const existing = await Click.findOne({ campaignId: campaign_id, pubId: pub_id, ip });
//     const isUnique = !existing;

//     const click = await Click.create({
//       campaignId: campaign_id,
//       pubId: pub_id,
//       clickId: uuidv4(),
//       ip,
//       userAgent,
//       referrer,
//       isUnique,
//       p1,
//       source
//     });

//     // Find campaign and increment click count
//     const campaign = await Compaign.findOneAndUpdate(
//       { compId: campaign_id },
//       { $inc: { clicks: 1 } },
//       { new: true }
//     );

//     if (!campaign) return res.status(404).send('INVALID_OFFER_ID');

//     // Set cookies
//     res.cookie('campaignId', campaign_id, {
//       maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false, secure: true, sameSite: 'None'
//     });
//     res.cookie('pubId', pub_id, {
//       maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false, secure: true, sameSite: 'None'
//     });
//     res.cookie('clickId', click.clickId, {
//       maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false, secure: true, sameSite: 'None'
//     });

//     // Redirect
//     const redirectUri = new URL(campaign.trakingUrl);
//     // redirectUri.searchParams.set('click_id', click._id);
//     // redirectUri.searchParams.set('campaign_id', campaign_id);
//     // redirectUri.searchParams.set('pub_id', pub_id);

//    return res.redirect(`${redirectUri.toString()}?cid=${click.clickId}&campaignId=${campaign_id}`);
//   } catch (error) {
//     console.error('Click tracking error:', error);
//     res.status(500).json({ message: 'Click tracking failed', error });
//   }
// };

