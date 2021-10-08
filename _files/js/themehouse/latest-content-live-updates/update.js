/** @param {jQuery} $ jQuery Object */
!function ($, window, document) {
    "use strict";

    $.fn.reverse = [].reverse;

    XF.THLatestContentLiveUpdates = XF.Element.newHandler({
        options: {
            thlcluUpdateRate: 5,
            thlcluSourceUrl: null,
            thlcluMaxContent: 5,
            thlcluActiveInBackground: false,
            thlcluMaxRecursiveCalls: 1
        },

        isPolling: false,
        container: null,
        newestId: null,
        oldestId: null,

        init: function () {
            this.container = $(this.$target).find('.js-newsFeedTarget');
            this.updateVars();

            let self = this;
            if (!this.thlcluActiveInBackground) {
                // Disable on active change
                document.addEventListener("visibilitychange", function () {
                    self.isPolling = document.visibilityState !== 'visible';
                });
            }

            window.setInterval(XF.proxy(this, 'updateContent'), this.options.thlcluUpdateRate * 1000);
        },

        updateVars: function () {
            let children = this.container.children(),
                max = 0,
                min = 0;

            children.each(function (index, element) {
                var id = $(element).data('thlclu-id');
                max = Math.max(max, id);
                min = Math.min(min, id);
            });

            this.newestId = max;
            this.oldestId = min;

            let pollMoreButton = $('.js-newsFeedLoadMore > a'),
                pollMoreUrl = new URL(this.options.thlcluSourceUrl);

            pollMoreUrl.searchParams.set('before_id', this.oldestId);
            pollMoreButton.attr('href', pollMoreUrl)
        },

        getLatestData: async function (before, depth) {
            if (!depth) {
                depth = 0;
            }
            else if (depth > this.options.thlcluMaxRecursiveCalls) {
                return [];
            }

            let url = this.options.thlcluSourceUrl;

            if (before) {
                url = new URL(this.options.thlcluSourceUrl);
                url.searchParams.set('before_id', before);
            }

            let response = await XF.ajax('GET', url, {}, null, {
                    skipDefault: true,
                    skipError: true,
                    global: false
                }),
                items = $(response.html.content)
                    .find('.js-newsFeedTarget')
                    .children()
                    .not('.is-ignored')
                    .reverse();

            let id = items.first().data('thlclu-id');
            if (id > this.newestId) {
                // Haven't reached the earlierst new item yet, poll next page
                items = (await this.getLatestData(id, depth + 1)).add(items);
            }

            let self = this;
            return items.filter(function (index, element) {
                return self.newestId < $(element).data('thlclu-id');
            });
        },

        updateContent: async function () {
            if (this.isPolling) {
                return;
            }

            this.isPolling = true;

            let data = await this.getLatestData(),
                target = this.container,
                self = this,
                interval = (this.options.thlcluUpdateRate * 1000) / (data.length || 1),
                timeout = 1;

            data.each(async function (index, element) {
                window.setTimeout(function () {
                    $(element).hide()
                        .prependTo(target)
                        .slideDown();

                    var children = self.container.children();
                    if (children.length > self.options.thlcluMaxContent) {
                        children.last()
                            .slideUp()
                            .delay(500, function () {
                                this.remove();
                            });
                    }
                }, timeout);
                timeout += interval;
            });

            window.setTimeout(function () {
                self.updateVars();
                self.isPolling = false;
            }, this.options.thlcluUpdateRate * 1000);
        }
    });

    XF.Element.register('th-latest-content-live-updates', 'XF.THLatestContentLiveUpdates');
}(jQuery, window, document);