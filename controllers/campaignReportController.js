import Campaign from '../models/compaignModel.js';
import Click from '../models/click.js';

export const getCampaignReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include full day

    // Step 1: Aggregate clicks grouped by campaignId
    const clickData = await Click.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$campaignId", // String in Click schema
          totalClicks: { $sum: 1 }
        }
      }
    ]);

    // Convert clickData IDs to numbers for matching with compId
    const campaignIds = clickData.map(c => Number(c._id));

    // Step 2: Fetch campaigns that had clicks in the date range
    const campaigns = await Campaign.find({ compId: { $in: campaignIds } });

    // Step 3: Build report
    const report = campaigns.map(campaign => {
      const clickInfo = clickData.find(cd => Number(cd._id) === campaign.compId);
      const clicks = clickInfo ? clickInfo.totalClicks : 0;
      const conversions = campaign.conversions || 0;
      const payout = parseFloat(campaign.payout) || 0;
      const cr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;
      const saleAmount = campaign.saleAmount || 0;
      const pendingConversions = campaign.pendingConversions || 0;
      const pendingPayout = payout * pendingConversions;

      return {
        Campaign: campaign.offerName,
        Clicks: clicks,
        Payout: payout,
        'Payout in INR': payout * conversions,
        Conversions: conversions,
        'Conversion Rate (CR)': `${cr} %`,
        'Sale Amount': saleAmount,
        'Sale Amount in INR': saleAmount,
        'Extended Conversions': campaign.extendedConversions || 0,
        'Cancelled Conversions': campaign.cancelledConversions || 0,
        'Pending Conversions': pendingConversions,
        'Pending Payout': pendingPayout,
        'Pending Payout in INR': pendingPayout
      };
    });

    // Step 4: Totals
    const totalClicks = report.reduce((sum, r) => sum + r.Clicks, 0);
    const totalConversions = report.reduce((sum, r) => sum + r.Conversions, 0);
    const totalPayout = report.reduce((sum, r) => sum + r['Payout in INR'], 0);
    const totalSaleAmount = report.reduce((sum, r) => sum + r['Sale Amount'], 0);
    const totalPendingPayout = report.reduce((sum, r) => sum + r['Pending Payout'], 0);
    const totalCR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

    report.push({
      Campaign: 'Total',
      Clicks: totalClicks,
      Payout: '',
      'Payout in INR': totalPayout,
      Conversions: totalConversions,
      'Conversion Rate (CR)': `Avg: ${totalCR} %`,
      'Sale Amount': totalSaleAmount,
      'Sale Amount in INR': totalSaleAmount,
      'Extended Conversions': '',
      'Cancelled Conversions': '',
      'Pending Conversions': '',
      'Pending Payout': '',
      'Pending Payout in INR': totalPendingPayout
    });

    res.json({ success: true, report });

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
