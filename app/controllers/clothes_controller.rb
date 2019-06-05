class ClothesController < ApplicationController
  def index
  end

  def get_clothes
    clothes = []
    if params[:page].present? & params[:category].present? & params[:websites].present?
      page = params[:page]
      category = params[:category]
      websites = JSON.parse(params[:websites])
      url_function = WebsiteUrlFunction.find_by(name: 'page')
      clothes = websites.each_with_object([]) do |website_id, clothes|
        website = Website.find(website_id)
        clothes.concat(website.scrape(category, page, url_function))
      end      
    end
    
    render :json => {'clothes': clothes}
  end

  def get_settings
    render :json => {
      'genders': Gender.all,
      'categories': Category.all
    }
  end

  def website_match
    websites = WebsiteUrlHtml
      .where(category: params[:category])
      .map{ |category| category.website }
      .sort_by { |website| website.name }
    render :json => {'websites': websites}
  end
end
