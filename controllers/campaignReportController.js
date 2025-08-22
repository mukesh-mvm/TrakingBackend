import Campaign from '../models/compaignModel.js';
import Click from '../models/click.js';
import Conversion from '../models/conversionModel.js';
import Affiliate from "../models/affiliateModel.js";

// export const getCampaignReport = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'Start and end date are required'
//       });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999); // include full day

//     // Step 1: Aggregate clicks grouped by campaignId
//     const clickData = await Click.aggregate([
//       {
//         $match: {
//           timestamp: { $gte: start, $lte: end }
//         }
//       },
//       {
//         $group: {
//           _id: "$campaignId", // String in Click schema
//           totalClicks: { $sum: 1 }
//         }
//       }
//     ]);

//     // Convert clickData IDs to numbers for matching with compId
//     const campaignIds = clickData.map(c => Number(c._id));

//     // Step 2: Fetch campaigns that had clicks in the date range
//     const campaigns = await Campaign.find({ compId: { $in: campaignIds } });

//     // Step 3: Build report
//     const report = campaigns.map(campaign => {
//       const clickInfo = clickData.find(cd => Number(cd._id) === campaign.compId);
//       const clicks = clickInfo ? clickInfo.totalClicks : 0;
//       const conversions = campaign.conversions || 0;
//       const payout = parseFloat(campaign.payout) || 0;
//       const cr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;
//       const saleAmount = campaign.saleAmount || 0;
//       const pendingConversions = campaign.pendingConversions || 0;
//       const pendingPayout = payout * pendingConversions;

//       return {
//         Campaign: campaign.offerName,
//         Clicks: clicks,
//         Payout: payout,
//         'Payout in INR': payout * conversions,
//         Conversions: conversions,
//         'Conversion Rate (CR)': `${cr} %`,
//         'Sale Amount': saleAmount,
//         'Sale Amount in INR': saleAmount,
//         'Extended Conversions': campaign.extendedConversions || 0,
//         'Cancelled Conversions': campaign.cancelledConversions || 0,
//         'Pending Conversions': pendingConversions,
//         'Pending Payout': pendingPayout,
//         'Pending Payout in INR': pendingPayout
//       };
//     });

//     // Step 4: Totals
//     const totalClicks = report.reduce((sum, r) => sum + r.Clicks, 0);
//     const totalConversions = report.reduce((sum, r) => sum + r.Conversions, 0);
//     const totalPayout = report.reduce((sum, r) => sum + r['Payout in INR'], 0);
//     const totalSaleAmount = report.reduce((sum, r) => sum + r['Sale Amount'], 0);
//     const totalPendingPayout = report.reduce((sum, r) => sum + r['Pending Payout'], 0);
//     const totalCR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

//     report.push({
//       Campaign: 'Total',
//       Clicks: totalClicks,
//       Payout: '',
//       'Payout in INR': totalPayout,
//       Conversions: totalConversions,
//       'Conversion Rate (CR)': `Avg: ${totalCR} %`,
//       'Sale Amount': totalSaleAmount,
//       'Sale Amount in INR': totalSaleAmount,
//       'Extended Conversions': '',
//       'Cancelled Conversions': '',
//       'Pending Conversions': '',
//       'Pending Payout': '',
//       'Pending Payout in INR': totalPendingPayout
//     });

//     res.json({ success: true, report });

//   } catch (err) {
//     console.error('Error generating report:', err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


export const getCampaignReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Step 1: Aggregate clicks grouped by campaignId
    const clickData = await Click.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$campaignId",
          totalClicks: { $sum: 1 },
          clickIds: { $push: "$clickId" }, // collect clickIds for conversion matching
        },
      },
    ]);

    if (clickData.length === 0) {
      return res.json({ success: true, report: [] });
    }

    // Step 2: Aggregate conversions for those clickIds
    const allClickIds = clickData.flatMap((cd) => cd.clickIds);
    const conversionData = await Conversion.aggregate([
      {
        $match: {
          clickId: { $in: allClickIds },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$campaignId",
          totalConversions: { $sum: 1 },
          totalSaleAmount: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]);

    // Step 3: Fetch campaigns
    const campaignIds = clickData.map((c) => Number(c._id));
    const campaigns = await Campaign.find({ compId: { $in: campaignIds } });

    // Step 4: Build report
    const report = campaigns.map((campaign) => {
      const clickInfo = clickData.find((cd) => Number(cd._id) === campaign.compId);
      const conversionInfo = conversionData.find((conv) => Number(conv._id) === campaign.compId);

      const clicks = clickInfo ? clickInfo.totalClicks : 0;
      const conversions = conversionInfo ? conversionInfo.totalConversions : 0;
      const payout = parseFloat(campaign.payout) || 0;
      const cr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;
      const saleAmount = conversionInfo ? conversionInfo.totalSaleAmount : 0;
      const pendingConversions = campaign.pendingConversions || 0;
      const pendingPayout = payout * pendingConversions;

      return {
        Campaign: campaign.offerName,
        Clicks: clicks,
        Payout: payout,
        "Payout in INR": payout * conversions,
        Conversions: conversions,
        "Conversion Rate (CR)": `${cr} %`,
        "Sale Amount": saleAmount,
        "Sale Amount in INR": saleAmount,
        "Extended Conversions": campaign.extendedConversions || 0,
        "Cancelled Conversions": campaign.cancelledConversions || 0,
        "Pending Conversions": pendingConversions,
        "Pending Payout": pendingPayout,
        "Pending Payout in INR": pendingPayout,
      };
    });

    // Step 5: Totals
    const totalClicks = report.reduce((sum, r) => sum + r.Clicks, 0);
    const totalConversions = report.reduce((sum, r) => sum + r.Conversions, 0);
    const totalPayout = report.reduce((sum, r) => sum + r["Payout in INR"], 0);
    const totalSaleAmount = report.reduce((sum, r) => sum + r["Sale Amount"], 0);
    const totalPendingPayout = report.reduce((sum, r) => sum + r["Pending Payout"], 0);
    const totalCR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

    report.push({
      Campaign: "Total",
      Clicks: totalClicks,
      Payout: "",
      "Payout in INR": totalPayout,
      Conversions: totalConversions,
      "Conversion Rate (CR)": `Avg: ${totalCR} %`,
      "Sale Amount": totalSaleAmount,
      "Sale Amount in INR": totalSaleAmount,
      "Extended Conversions": "",
      "Cancelled Conversions": "",
      "Pending Conversions": "",
      "Pending Payout": "",
      "Pending Payout in INR": totalPendingPayout,
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





export const getCampaignByPubIdReport = async (req, res) => {
  try {
    const { startDate, endDate, pubId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start and end date are required",
      });
    }

    if (!pubId) {
      return res.status(400).json({
        success: false,
        message: "pubId is required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Step 1: Aggregate clicks grouped by campaignId (filter by pubId + date)
    const clickData = await Click.aggregate([
      {
        $match: {
          pubId: pubId.toString(),
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$campaignId",
          totalClicks: { $sum: 1 },
          clickIds: { $push: "$clickId" },
        },
      },
    ]);

    if (clickData.length === 0) {
      return res.json({ success: true, report: [] });
    }

    // Step 2: Aggregate conversions (filter by pubId + date + matching clickIds)
    const allClickIds = clickData.flatMap((cd) => cd.clickIds);
    const conversionData = await Conversion.aggregate([
      {
        $match: {
          pubId: pubId.toString(),
          clickId: { $in: allClickIds },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$campaignId",
          totalConversions: { $sum: 1 },
          totalSaleAmount: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]);

    // Step 3: Fetch campaign details
    const campaignIds = clickData.map((c) => Number(c._id));
    const campaigns = await Campaign.find({ compId: { $in: campaignIds } });

    // Step 4: Build report
    const report = campaigns.map((campaign) => {
      const clickInfo = clickData.find((cd) => Number(cd._id) === campaign.compId);
      const conversionInfo = conversionData.find((conv) => Number(conv._id) === campaign.compId);

      const clicks = clickInfo ? clickInfo.totalClicks : 0;
      const conversions = conversionInfo ? conversionInfo.totalConversions : 0;
      const payout = parseFloat(campaign.payout) || 0;
      const cr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;
      const saleAmount = conversionInfo ? conversionInfo.totalSaleAmount : 0;
      const pendingConversions = campaign.pendingConversions || 0;
      const pendingPayout = payout * pendingConversions;

      return {
        Campaign: campaign.offerName,
        pubId: Number(pubId),
        Clicks: clicks,
        Payout: payout,
        "Payout in INR": payout * conversions,
        Conversions: conversions,
        "Conversion Rate (CR)": `${cr} %`,
        "Sale Amount": saleAmount,
        "Sale Amount in INR": saleAmount,
        "Extended Conversions": campaign.extendedConversions || 0,
        "Cancelled Conversions": campaign.cancelledConversions || 0,
        "Pending Conversions": pendingConversions,
        "Pending Payout": pendingPayout,
        "Pending Payout in INR": pendingPayout,
      };
    });

    // Step 5: Totals
    const totalClicks = report.reduce((sum, r) => sum + r.Clicks, 0);
    const totalConversions = report.reduce((sum, r) => sum + r.Conversions, 0);
    const totalPayout = report.reduce((sum, r) => sum + r["Payout in INR"], 0);
    const totalSaleAmount = report.reduce((sum, r) => sum + r["Sale Amount"], 0);
    const totalPendingPayout = report.reduce((sum, r) => sum + r["Pending Payout"], 0);
    const totalCR =
      totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

    report.push({
      Campaign: "Total",
      pubId: Number(pubId),
      Clicks: totalClicks,
      Payout: "",
      "Payout in INR": totalPayout,
      Conversions: totalConversions,
      "Conversion Rate (CR)": `Avg: ${totalCR} %`,
      "Sale Amount": totalSaleAmount,
      "Sale Amount in INR": totalSaleAmount,
      "Extended Conversions": "",
      "Cancelled Conversions": "",
      "Pending Conversions": "",
      "Pending Payout": "",
      "Pending Payout in INR": totalPendingPayout,
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





// import Click from "../models/clickModel.js";
// import Conversion from "../models/conversionModel.js";


// export const getAffiliateReportByDate = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Start and end date are required",
//       });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     // Step 1: Click aggregation grouped by pubId
//     const clickData = await Click.aggregate([
//       {
//         $match: { timestamp: { $gte: start, $lte: end } },
//       },
//       {
//         $group: {
//           _id: "$pubId",
//           totalClicks: { $sum: 1 },
//           clickIds: { $push: "$clickId" },
//         },
//       },
//     ]);

//     if (clickData.length === 0) {
//       return res.json({ success: true, report: [] });
//     }

//     // Step 2: Collect all clickIds
//     const allClickIds = clickData.flatMap((c) => c.clickIds);

//     // Step 3: Conversion aggregation grouped by pubId
//     const conversionData = await Conversion.aggregate([
//       {
//         $match: {
//           clickId: { $in: allClickIds },
//           timestamp: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: "$pubId",
//           totalConversions: { $sum: 1 },
//           totalSaleAmount: { $sum: { $toDouble: "$amount" } },
//         },
//       },
//     ]);

//     // Step 4: Fetch Affiliate details
//     const pubIds = clickData.map((c) => c._id);
//     const affiliates = await Affiliate.find({ pubId: { $in: pubIds } });

//     // Step 5: Build Report
//     const report = affiliates.map((affiliate) => {
//       const clickInfo = clickData.find((c) => c._id === String(affiliate.pubId));
//       const convInfo = conversionData.find((c) => c._id === String(affiliate.pubId));

//       const clicks = clickInfo ? clickInfo.totalClicks : 0;
//       const conversions = convInfo ? convInfo.totalConversions : 0;
//       const saleAmount = convInfo ? convInfo.totalSaleAmount : 0;

//       const cr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;

//       return {
//         Affiliate: affiliate.affiliateName,
//         pubId: affiliate.pubId,
//         Clicks: clicks,
//         Conversions: conversions,
//         "Conversion Rate (CR)": `${cr} %`,
//         "Sale Amount": saleAmount,
//       };
//     });

//     // Step 6: Totals
//     const totalClicks = report.reduce((s, r) => s + r.Clicks, 0);
//     const totalConversions = report.reduce((s, r) => s + r.Conversions, 0);
//     const totalSaleAmount = report.reduce((s, r) => s + r["Sale Amount"], 0);
//     const avgCR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

//     report.push({
//       Affiliate: "Total",
//       pubId: "-",
//       Clicks: totalClicks,
//       Conversions: totalConversions,
//       "Conversion Rate (CR)": `Avg: ${avgCR} %`,
//       "Sale Amount": totalSaleAmount,
//     });

//     res.json({ success: true, report });
//   } catch (err) {
//     console.error("Error generating affiliate report:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };






export const getAffiliateReportByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Step 1: Aggregate Clicks grouped by pubId
    const clickData = await Click.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $toInt: "$pubId" }, // ✅ convert pubId to number
          totalClicks: { $sum: 1 },
          clickIds: { $push: "$clickId" },
        },
      },
    ]);

    if (clickData.length === 0) {
      return res.json({ success: true, report: [] });
    }

    // Step 2: Collect clickIds
    const allClickIds = clickData.flatMap((c) => c.clickIds);

    // Step 3: Aggregate Conversions grouped by pubId
    const conversionData = await Conversion.aggregate([
      {
        $match: {
          clickId: { $in: allClickIds },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $toInt: "$pubId" }, // ✅ convert pubId to number
          totalConversions: { $sum: 1 },
          totalSaleAmount: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]);

    // Step 4: Fetch Affiliate details
    const pubIds = clickData.map((c) => c._id);
    const affiliates = await Affiliate.find({ pubId: { $in: pubIds } });

    // Step 5: Build Report per Affiliate
    const report = affiliates.map((affiliate) => {
      const clickInfo = clickData.find((c) => c._id === affiliate.pubId);
      const convInfo = conversionData.find((c) => c._id === affiliate.pubId);

      const clicks = clickInfo ? clickInfo.totalClicks : 0;
      const conversions = convInfo ? convInfo.totalConversions : 0;
      const saleAmount = convInfo ? convInfo.totalSaleAmount : 0;

      // Example payout logic (replace with dynamic if needed)
      const payoutPerConversion = 50;
      const payoutInINR = payoutPerConversion * conversions;

      const cr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;

      const pendingConversions = affiliate.pendingConversions || 0;
      const pendingPayout = payoutPerConversion * pendingConversions;

      return {
        Affiliate: affiliate.affiliateName,
        pubId: affiliate.pubId,
        Clicks: clicks,
        Payout: payoutPerConversion,
        "Payout in INR": payoutInINR,
        Conversions: conversions,
        "Conversion Rate (CR)": `${cr} %`,
        "Sale Amount": saleAmount,
        "Sale Amount in INR": saleAmount,
        "Extended Conversions": affiliate.extendedConversions || 0,
        "Cancelled Conversions": affiliate.cancelledConversions || 0,
        "Pending Conversions": pendingConversions,
        "Pending Payout": pendingPayout,
        "Pending Payout in INR": pendingPayout,
      };
    });

    // Step 6: Totals
    const totalClicks = report.reduce((s, r) => s + r.Clicks, 0);
    const totalConversions = report.reduce((s, r) => s + r.Conversions, 0);
    const totalPayout = report.reduce((s, r) => s + r["Payout in INR"], 0);
    const totalSaleAmount = report.reduce((s, r) => s + r["Sale Amount"], 0);
    const totalPendingPayout = report.reduce((s, r) => s + r["Pending Payout"], 0);
    const avgCR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

    report.push({
      Affiliate: "Total",
      pubId: "-",
      Clicks: totalClicks,
      Payout: "",
      "Payout in INR": totalPayout,
      Conversions: totalConversions,
      "Conversion Rate (CR)": `Avg: ${avgCR} %`,
      "Sale Amount": totalSaleAmount,
      "Sale Amount in INR": totalSaleAmount,
      "Extended Conversions": "",
      "Cancelled Conversions": "",
      "Pending Conversions": "",
      "Pending Payout": "",
      "Pending Payout in INR": totalPendingPayout,
    });

    res.json({ success: true, report });
  } catch (err) {
    console.error("Error generating affiliate report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



