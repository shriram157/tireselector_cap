using tireSelector as DealerMarkUp from '../db/tireSelector';

service CatalogService @(path : '/tireSelector') {
    @readonly entity dealerMarkUp as projection on DealerMarkUp.dealerMarkUp;
}
