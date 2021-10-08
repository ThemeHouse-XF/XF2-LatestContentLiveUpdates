<?php

namespace ThemeHouse\LatestContentLiveUpdates\XF\Repository;

use XF\Pub\Controller\WhatsNew;

class NewsFeed extends XFCP_NewsFeed
{
    public function findNewsFeed($applyPrivacyChecks = true)
    {
        $finder = parent::findNewsFeed($applyPrivacyChecks);

        if (\XF::options()->thlatestcontentliveupdates_removeReactions) {
            $trace = debug_backtrace();
            if (!empty($trace[1])) {
                if ($trace[1]['object'] instanceof WhatsNew && in_array($trace[1]['function'],
                        ['actionLatestActivity', 'actionNewsFeed'])) {
                    $finder->where('action', '<>', 'reaction');
                }
            }
        }

        return $finder;
    }
}
