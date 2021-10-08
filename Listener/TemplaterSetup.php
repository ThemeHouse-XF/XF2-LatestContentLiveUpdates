<?php

namespace ThemeHouse\LatestContentLiveUpdates\Listener;

use XF\Container;
use XF\Template\Templater;

class TemplaterSetup
{
    public static function templaterSetup(Container $container, Templater &$templater)
    {
        $templater->addFunction('th_lclu_route', [__CLASS__, 'fnLCLURoute']);
    }

    public static function fnLCLURoute($templater, &$escape)
    {
        $request = \XF::app()->request();
        return \XF::app()->router('public')->buildLink('canonical:' . $request->getRoutePath());
    }
}
